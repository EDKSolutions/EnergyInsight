import { 
  getPlutoDataByBbl, 
  getCooperativeNoiByBbl, 
  getCondominiumNoiByBbl,
  PlutoData,
  CooperativeNoiData,
  CondominiumNoiData
} from './open-data-nyc';

export type BuildingType = 'COOPERATIVE' | 'CONDOMINIUM' | 'RENTAL';

export interface NoiResult {
  bbl: string;
  buildingType: BuildingType;
  noiValue: number;
  dataSource: string;
  calculationMethod: string;
  reportYear?: string;
  rawData?: CooperativeNoiData | CondominiumNoiData | RentalCalculationData;
}

export interface RentalCalculationData {
  buildingSquareFeet: number;
  borough: string;
  yearBuilt: number;
  unitBreakdown: {
    studio: number;
    oneBed: number;
    twoBed: number;
    threePlus: number;
  };
  ratePerUnitPerMonth: number;
  ageMultiplier: number;
  supplementalIncomeMultiplier: number;
  noiMargin: number;
  grossIncome: number;
  calculatedNoi: number;
}

// NYC Building Class Code mappings for residential buildings
// Source: NYC Department of Finance Building Classifications
const COOPERATIVE_BUILDING_CLASSES = [
  'C0', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'
];

const CONDOMINIUM_BUILDING_CLASSES = [
  'R4', // Condominiums
  'R5', // Condominium garages
  'R6A', 'R6B', // Condominium apartment buildings
  'R7A', 'R7B', // Condominium apartment buildings
  'R8A', 'R8B', // Condominium apartment buildings  
  'R9A', 'R9B', // Condominium apartment buildings
  'RM',  // Rental Multi-family (often used for condominiums in NYC data)
  'RR',  // Rental buildings (often used for condominium rentals)
  'D4',  // Apartment buildings with commercial units (condominium)
  'D5',  // Apartment buildings with commercial units (condominium)
  'D6',  // Apartment buildings with commercial units (condominium)
  'D7',  // Apartment buildings with commercial units (condominium)
  'D8',  // Apartment buildings with commercial units (condominium)
  'D9'   // Apartment buildings with commercial units (condominium)
];

// Rental rates by borough based on NYC Rent Guidelines Board 2024 Income & Expense Study
// Source: https://rentguidelinesboard.cityofnewyork.us/wp-content/uploads/2024/03/2024-IE-Study.pdf
const RENTAL_RATES_BY_BOROUGH = {
  // Manhattan rates (per unit per month)
  '1': { // Manhattan
    core: 3118, // Core Manhattan
    upper: 1649, // Upper Manhattan  
    default: 2498 // Manhattan average when sub-area unknown
  },
  '2': { // Bronx
    default: 1224
  },
  '3': { // Brooklyn
    default: 1640
  },
  '4': { // Queens
    default: 1603
  },
  '5': { // Staten Island
    default: 1166
  }
};

// Building age multipliers based on RPIE study data
// Pre-1974 buildings: $1,587/unit, Post-1973: $2,552/unit
const BUILDING_AGE_MULTIPLIERS = {
  PRE_1974: 1587 / 1769, // 0.897 - below average
  POST_1973: 2552 / 1769  // 1.442 - above average
};

export function classifyBuildingType(buildingClass: string): BuildingType {
  const upperBuildingClass = buildingClass.toUpperCase();
  
  if (COOPERATIVE_BUILDING_CLASSES.includes(upperBuildingClass)) {
    return 'COOPERATIVE';
  }
  
  if (CONDOMINIUM_BUILDING_CLASSES.some(cls => upperBuildingClass.startsWith(cls))) {
    return 'CONDOMINIUM';
  }
  
  // Default to rental for all other residential building types
  // This includes R1, R2, R3, R6, R7, R8, R9 (non-condominium variants)
  return 'RENTAL';
}

function calculateRentalNoi(
  plutoData: PlutoData, 
  unitBreakdown: { studio: number; oneBed: number; twoBed: number; threePlus: number }
): RentalCalculationData {
  const buildingSquareFeet = plutoData.bldgarea || 0;
  const borough = plutoData.borough;
  const yearBuilt = plutoData.yearbuilt || 0;
  
  
  if (buildingSquareFeet === 0) {
    throw new Error(`Building square footage is missing or zero for BBL ${plutoData.bbl}`);
  }
  
  if (!borough) {
    throw new Error(`Borough information is missing for BBL ${plutoData.bbl}`);
  }
  
  if (yearBuilt === 0) {
    throw new Error(`Year built is missing for BBL ${plutoData.bbl}`);
  }
  
  // Get borough code from borough name
  let boroughCode: string;
  switch (borough.toLowerCase()) {
    case 'manhattan':
    case 'mn':
      boroughCode = '1';
      break;
    case 'bronx':
    case 'bx':
      boroughCode = '2';
      break;
    case 'brooklyn':
    case 'bk':
      boroughCode = '3';
      break;
    case 'queens':
    case 'qn':
      boroughCode = '4';
      break;
    case 'staten island':
    case 'si':
      boroughCode = '5';
      break;
    default:
      throw new Error(`Unknown borough: ${borough} for BBL ${plutoData.bbl}`);
  }
  
  const boroughRates = RENTAL_RATES_BY_BOROUGH[boroughCode as keyof typeof RENTAL_RATES_BY_BOROUGH];
  if (!boroughRates) {
    throw new Error(`No rental rates available for borough code ${boroughCode}`);
  }
  
  const ratePerUnitPerMonth = boroughRates.default;
  
  // Calculate age multiplier
  const ageMultiplier = yearBuilt <= 1974 ? BUILDING_AGE_MULTIPLIERS.PRE_1974 : BUILDING_AGE_MULTIPLIERS.POST_1973;
  
  // Calculate total units
  const totalUnits = unitBreakdown.studio + unitBreakdown.oneBed + unitBreakdown.twoBed + unitBreakdown.threePlus;
  
  if (totalUnits === 0) {
    throw new Error(`No residential units found in unit breakdown for BBL ${plutoData.bbl}`);
  }
  
  // Calculate annual rental income
  const adjustedRatePerUnit = ratePerUnitPerMonth * ageMultiplier;
  const annualRentalIncome = totalUnits * adjustedRatePerUnit * 12;
  
  // Add supplemental income (10.8% average per RPIE study)
  const supplementalIncomeMultiplier = 1.108;
  const grossIncome = annualRentalIncome * supplementalIncomeMultiplier;
  
  // Apply NOI margin (45% after operating expenses and taxes)
  const noiMargin = 0.45;
  const calculatedNoi = grossIncome * noiMargin;
  
  return {
    buildingSquareFeet,
    borough,
    yearBuilt,
    unitBreakdown,
    ratePerUnitPerMonth: adjustedRatePerUnit,
    ageMultiplier,
    supplementalIncomeMultiplier,
    noiMargin,
    grossIncome,
    calculatedNoi
  };
}

export async function getNoiByBbl(
  bbl: string, 
  unitBreakdown?: { studio: number; oneBed: number; twoBed: number; threePlus: number }
): Promise<NoiResult> {
  console.log(`Fetching NOI for BBL: ${bbl}`);
  
  // Get PLUTO data for building classification
  const plutoData = await getPlutoDataByBbl(bbl);
  if (!plutoData) {
    throw new Error(`PLUTO data not found for BBL: ${bbl}`);
  }
  
  const buildingType = classifyBuildingType(plutoData.bldgclass);
  console.log(`Building type classified as: ${buildingType} for building class ${plutoData.bldgclass}`);
  console.log(`Building details: ${plutoData.borough} borough, year built: ${plutoData.yearbuilt}, residential units: ${plutoData.unitsres}`);
  
  try {
    switch (buildingType) {
      case 'COOPERATIVE': {
        const coopData = await getCooperativeNoiByBbl(bbl);
        if (coopData && coopData.net_operating_income) {
          const noiValue = parseFloat(coopData.net_operating_income);
          if (!isNaN(noiValue) && noiValue > 0) {
            return {
              bbl,
              buildingType,
              noiValue,
              dataSource: 'NYC Open Data - Cooperative Comparable Rental Income',
              calculationMethod: 'Direct API value',
              reportYear: coopData.report_year,
              rawData: coopData
            };
          }
        }
        
        // Fallback to rental calculation if API data unavailable
        if (!unitBreakdown) {
          throw new Error(`Cooperative NOI data not available for BBL: ${bbl} and unit breakdown not provided. Either provide unit breakdown parameters or use a building with available NYC Open Data.`);
        }
        
        console.log(`Cooperative API data unavailable for BBL ${bbl}, using rental calculation method`);
        const rentalCalc = calculateRentalNoi(plutoData, unitBreakdown);
        
        return {
          bbl,
          buildingType,
          noiValue: rentalCalc.calculatedNoi,
          dataSource: 'NYC Rent Guidelines Board 2024 Income & Expense Study (NYC Open Data unavailable)',
          calculationMethod: 'Calculated using rental method (API data unavailable)',
          rawData: rentalCalc
        };
      }
      
      case 'CONDOMINIUM': {
        const condoData = await getCondominiumNoiByBbl(bbl);
        if (condoData && condoData.net_operating_income) {
          const noiValue = parseFloat(condoData.net_operating_income);
          if (!isNaN(noiValue) && noiValue > 0) {
            return {
              bbl,
              buildingType,
              noiValue,
              dataSource: 'NYC Open Data - Condominium Comparable Rental Income',
              calculationMethod: 'Direct API value',
              reportYear: condoData.report_year,
              rawData: condoData
            };
          }
        }
        
        // Fallback to rental calculation if API data unavailable
        if (!unitBreakdown) {
          throw new Error(`Condominium NOI data not available for BBL: ${bbl} and unit breakdown not provided. Either provide unit breakdown parameters or use a building with available NYC Open Data.`);
        }
        
        console.log(`Condominium API data unavailable for BBL ${bbl}, using rental calculation method`);
        const rentalCalc = calculateRentalNoi(plutoData, unitBreakdown);
        
        return {
          bbl,
          buildingType,
          noiValue: rentalCalc.calculatedNoi,
          dataSource: 'NYC Rent Guidelines Board 2024 Income & Expense Study (NYC Open Data unavailable)',
          calculationMethod: 'Calculated using rental method (API data unavailable)',
          rawData: rentalCalc
        };
      }
      
      case 'RENTAL': {
        if (!unitBreakdown) {
          throw new Error(`Unit breakdown data required for rental building NOI calculation for BBL: ${bbl}`);
        }
        
        const rentalCalc = calculateRentalNoi(plutoData, unitBreakdown);
        
        return {
          bbl,
          buildingType,
          noiValue: rentalCalc.calculatedNoi,
          dataSource: 'NYC Rent Guidelines Board 2024 Income & Expense Study',
          calculationMethod: 'Calculated from unit count, borough rates, and building age',
          rawData: rentalCalc
        };
      }
      
      default:
        throw new Error(`Unsupported building type: ${buildingType} for BBL: ${bbl}`);
    }
  } catch (error) {
    console.error(`Error calculating NOI for BBL ${bbl}:`, error);
    throw error;
  }
}