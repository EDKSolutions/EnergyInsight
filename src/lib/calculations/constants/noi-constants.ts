/**
 * NOI (Net Operating Income) Constants
 * Based on LaTeX Document Section 9 - NOI Analysis
 */

// NYC Borough Types and Mappings
export type BoroughCode = 'MN' | 'BK' | 'QN' | 'BX' | 'SI';
export type BoroughName = 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island';
export type CommunityDistrict = 101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110 | 111 | 112;

export const BOROUGH_CODE_TO_NAME: Record<BoroughCode, BoroughName> = {
  'MN': 'Manhattan',
  'BK': 'Brooklyn', 
  'QN': 'Queens',
  'BX': 'Bronx',
  'SI': 'Staten Island'
} as const;

export const BOROUGH_NAME_TO_CODE: Record<BoroughName, BoroughCode> = {
  'Manhattan': 'MN',
  'Brooklyn': 'BK',
  'Queens': 'QN', 
  'Bronx': 'BX',
  'Staten Island': 'SI'
} as const;

// NYC Open Data API Endpoints
export const NOI_DATA_SOURCES = {
  cooperativeApiUrl: 'https://data.cityofnewyork.us/resource/myei-c3fa.json',
  condominiumApiUrl: 'https://data.cityofnewyork.us/resource/9ck6-2jew.json',
} as const;

// Building Classification for NOI Lookup
export const NOI_BUILDING_CLASSES = {
  // Cooperative Buildings (get NOI from cooperative API)
  cooperative: ['C0', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'],
  
  // Condominium Buildings (get NOI from condominium API)  
  condominium: ['R4', 'R5', 'R6A', 'R6B', 'R7A', 'R7B', 'R7D', 'R7X', 'R8A', 'R8B', 'R8X', 'R9A', 'R9B', 'R9X', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9'],
  
  // All other residential buildings use RGB Study fallback
} as const;

// NYC Community Districts for Location Assignment
export const NYC_COMMUNITY_DISTRICTS = {
  coreManhattan: [101, 102, 103, 104, 105, 106, 107, 108], // CD 101-108
  upperManhattan: [109, 110, 111, 112], // CD 109-112
  // All other boroughs/districts are categorized by borough
} as const;

// Rent Stabilization Heuristic Criteria (fallback when registry lookup fails)
export const RENT_STABILIZATION_CRITERIA = {
  prewarCutoffYear: 1974, // Buildings built before 1974 more likely to be stabilized
  highRiseMinFloors: 7,   // Buildings with 7+ floors more likely to be stabilized
  // Additional heuristics: not condo, not coop
} as const;

// NOI Growth Rate Constants
export const DEFAULT_NOI_GROWTH_RATE = 0.03; // 3% annual growth for inflation/appreciation

// RGB Study Data Structure Categories
export const RGB_STUDY_CATEGORIES = {
  tenure: {
    stabilized: 'stabilized',
    marketRate: 'market_rate',
  },
  
  location: {
    coreManhattan: 'Core Manhattan',
    upperManhattan: 'Upper Manhattan', 
    brooklyn: 'Brooklyn',
    queens: 'Queens',
    bronx: 'Bronx',
    statenIsland: 'Staten Island',
    manhattan: 'Manhattan',
  },
  
  buildingSize: {
    small: '11-19 units', // 11-19 units
    medium: '20-99 units', // 20-99 units  
    large: '100+ units', // 100+ units
  },
  
  buildingEra: {
    pre1974: 'pre_1974', // Built ≤1973 (only for stabilized buildings)
    post1973: 'post_1973', // Built >1973 (only for stabilized buildings)
    // Market rate data is not segmented by era
  },
} as const;

/**
 * Determine if building is likely rent stabilized
 * Uses BBL lookup first, then heuristic fallback
 * 
 * @param bbl - Building BBL identifier
 * @param pluto - PLUTO building data
 * @param rentStabilizedBBLs - Set of known rent stabilized BBLs
 * @returns True if building is likely rent stabilized
 */
export function isRentStabilized(
  bbl: string,
  pluto: { yearBuilt: number; numFloors: number; condoNo?: string; bldgClass: string },
  rentStabilizedBBLs: Set<string>
): boolean {
  // Primary method: BBL lookup in rent stabilized buildings registry
  if (rentStabilizedBBLs.has(bbl)) {
    return true;
  }
  
  // Fallback heuristic based on PLUTO data
  const isPrewar = pluto.yearBuilt > 0 && pluto.yearBuilt < RENT_STABILIZATION_CRITERIA.prewarCutoffYear;
  const isHighRise = pluto.numFloors >= RENT_STABILIZATION_CRITERIA.highRiseMinFloors;
  const isNotCondo = pluto.condoNo == null;
  const isNotCoop = !pluto.bldgClass.includes('C6') && !pluto.bldgClass.includes('D4');
  
  return isPrewar && isHighRise && isNotCondo && isNotCoop;
}

/**
 * Convert borough code to borough name
 * 
 * @param boroughCode - NYC borough code (MN, BK, QN, BX, SI)
 * @returns Full borough name
 * @throws Error if borough code is invalid
 */
export function convertBoroughCodeToName(boroughCode: string): BoroughName {
  const code = boroughCode.toUpperCase() as BoroughCode;
  const name = BOROUGH_CODE_TO_NAME[code];
  
  if (!name) {
    throw new Error(`Invalid borough code '${boroughCode}'. Supported codes: MN, BK, QN, BX, SI`);
  }
  
  return name;
}

/**
 * Get location category for RGB Study lookup
 * Handles both borough codes (MN, BK, etc.) and full names (Manhattan, Brooklyn, etc.)
 * 
 * @param borough - Borough code or name
 * @param communityDistrict - Community district number (if Manhattan)
 * @returns Location category for RGB Study
 * @throws Error if borough cannot be mapped to a location category
 */
export function getLocationCategory(
  borough: string,
  communityDistrict?: number
): string {
  // Convert borough code to name if needed
  let boroughName: string;
  try {
    // First try as borough code
    boroughName = convertBoroughCodeToName(borough);
  } catch {
    // If that fails, use as-is (assume it's already a name)
    boroughName = borough;
  }
  
  const boroLower = boroughName.toLowerCase();
  
  if (boroLower === 'manhattan' && communityDistrict) {
    const manhattanDistricts = NYC_COMMUNITY_DISTRICTS.coreManhattan as readonly number[];
    const upperManhattanDistricts = NYC_COMMUNITY_DISTRICTS.upperManhattan as readonly number[];
    
    if (manhattanDistricts.includes(communityDistrict)) {
      return RGB_STUDY_CATEGORIES.location.coreManhattan;
    }
    if (upperManhattanDistricts.includes(communityDistrict)) {
      return RGB_STUDY_CATEGORIES.location.upperManhattan;
    }
  }
  
  // Map other boroughs
  switch (boroLower) {
    case 'brooklyn': return RGB_STUDY_CATEGORIES.location.brooklyn;
    case 'queens': return RGB_STUDY_CATEGORIES.location.queens;
    case 'bronx': return RGB_STUDY_CATEGORIES.location.bronx;
    case 'staten island': return RGB_STUDY_CATEGORIES.location.statenIsland;
    case 'manhattan': 
      return RGB_STUDY_CATEGORIES.location.manhattan;
    default: 
      throw new Error(`Unable to map borough '${borough}' to RGB Study location category. Supported: MN/Manhattan (with community district), BK/Brooklyn, QN/Queens, BX/Bronx, SI/Staten Island`);
  }
}

/**
 * Get building size category for RGB Study lookup
 * 
 * @param unitsRes - Number of residential units
 * @returns Building size category
 */
export function getBuildingSizeCategory(unitsRes: number): string {
  if (unitsRes >= 100) return RGB_STUDY_CATEGORIES.buildingSize.large;
  if (unitsRes >= 20) return RGB_STUDY_CATEGORIES.buildingSize.medium;
  return RGB_STUDY_CATEGORIES.buildingSize.small;
}

/**
 * Get building era category for RGB Study lookup (stabilized buildings only)
 * 
 * @param yearBuilt - Building construction year
 * @returns Building era category
 */
export function getBuildingEraCategory(yearBuilt: number): string {
  return yearBuilt <= 1973 
    ? RGB_STUDY_CATEGORIES.buildingEra.pre1974
    : RGB_STUDY_CATEGORIES.buildingEra.post1973;
}

/**
 * Check if building class is cooperative
 * 
 * @param buildingClass - Building class code
 * @returns True if cooperative building
 */
export function isCooperativeBuilding(buildingClass: string): boolean {
  return NOI_BUILDING_CLASSES.cooperative.some(cls => buildingClass.includes(cls));
}

/**
 * Check if building class is condominium
 * 
 * @param buildingClass - Building class code
 * @returns True if condominium building
 */
export function isCondominiumBuilding(buildingClass: string): boolean {
  const condominiumClasses = NOI_BUILDING_CLASSES.condominium as readonly string[];
  return condominiumClasses.includes(buildingClass);
}

// Combined export for easy access
export const NOI_CONSTANTS = {
  ...NOI_DATA_SOURCES,
  ...NOI_BUILDING_CLASSES,
  ...NYC_COMMUNITY_DISTRICTS,
  ...RENT_STABILIZATION_CRITERIA,
  ...RGB_STUDY_CATEGORIES,
} as const;

// Type for NOI constant keys
export type NOIConstantKey = keyof typeof NOI_CONSTANTS;