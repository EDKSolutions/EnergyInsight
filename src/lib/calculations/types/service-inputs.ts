/**
 * Service Input Interfaces
 * Defines input types for all calculation services
 */

import { Calculations } from '@prisma/client';

// Base interface for all service inputs
export interface BaseServiceInput {
  calculationId: string;
}

// 1. AI Unit Breakdown Service Input
export interface AIUnitBreakdownInput extends BaseServiceInput {
  plutoData: {
    bldgclass: string;
    resarea: number;
    unitsres: number;
    unitstotal: number;
    boro: string;
    lotarea: number;
    bldgarea: number;
    yearbuilt: number;
    landuse: string;
    numfloors: number;
    lotdepth: number;
    lotfront: number;
    zip: string;
    address: string;
    zone: string;
    ownername: string;
  };
  ll84Data?: {
    site_eui?: number;
    weather_norm_site_eui?: number;
    [key: string]: unknown;
  } | null;
}

// 2. Energy Calculation Service Input (Sections 2-6)
export interface EnergyCalculationInput extends BaseServiceInput {
  // Required inputs from AI service
  ptacUnits: number;
  
  // Required inputs from building data
  yearBuilt: number;
  numFloors: number;
  
  // Overridable energy constants (all optional with defaults)
  annualUnitThermsHeatingPTAC?: number;      // Default: 255
  annualUnitKwhCoolingPTAC?: number;         // Default: 1600
  annualUnitMMBtuHeatingPTAC?: number;       // Default: 25.5
  annualUnitMMBtuCoolingPTAC?: number;       // Default: 5.459427
  heatingCapacityPTHP?: number;              // Default: 8 KBtu
  pthpCOP?: number;                          // Default: 1.51
  pthpUnitCost?: number;                     // Default: 1100
  pthpInstallationCost?: number;             // Default: 450
  pthpContingency?: number;                  // Default: 0.10
  priceKwhHour?: number;                     // Default: 0.24
  priceThermHour?: number;                   // Default: 1.45
}

// 3. LL97 Service Input (Section 7)
export interface LL97CalculationInput extends BaseServiceInput {
  // Building characteristics
  buildingClass: string;
  totalSquareFeet: number;
  
  // Current emissions from LL84 data
  totalBuildingEmissionsLL84: number;
  
  // Property use breakdown from LL84 data (list_of_all_property_use field)
  propertyUseBreakdown?: string;
  
  // Energy calculations from energy service
  annualBuildingMMBtuHeatingPTAC: number;
  annualBuildingkWhHeatingPTHP: number; // Using EFLH calculation
  
  // Overridable LL97 constants (optional with defaults)
  feePerTonCO2e?: number;                    // Default: 268
  efGas?: number;                            // Default: 0.05311
  efGrid2024to2029?: number;                 // Default: 0.000288962
  efGrid2030to2034?: number;                 // Default: 0.000145
  beCoefficientBefore2027?: number;          // Default: 0.0013
  beCoefficient2027to2029?: number;          // Default: 0.00065
}

// 4. Financial Service Input (Section 8)
export interface FinancialCalculationInput extends BaseServiceInput {
  // Basic financial data
  totalRetrofitCost: number;
  annualEnergySavings: number;
  
  // LL97 fee avoidance data from LL97 service
  annualFeeExceedingBudget2024to2029: number;
  annualFeeExceedingBudget2030to2034: number;
  annualFeeExceedingBudget2035to2039: number;
  annualFeeExceedingBudget2040to2049: number;
  
  adjustedAnnualFeeBefore2027: number;
  adjustedAnnualFee2027to2029: number;
  adjustedAnnualFee2030to2034: number;
  adjustedAnnualFee2035to2039: number;
  adjustedAnnualFee2040to2049: number;
  
  // Overridable financial parameters (optional with defaults)
  loanPrincipal?: number;                    // Default: totalRetrofitCost
  loanTermYears?: number;                    // Default: 15
  annualInterestRate?: number;               // Default: 0.06
  analysisStartYear?: number;                // Default: 2024
  analysisEndYear?: number;                  // Default: 2050
  upgradeYear?: number;                      // Default: 2025
  loanStartYear?: number;                    // Default: 2025
}

// 5. NOI Service Input (Section 9)
export interface NOICalculationInput extends BaseServiceInput {
  // Building identification and characteristics (required for NOI source determination)
  bbl: string;                    // Borough-Block-Lot identifier for API lookups
  buildingClass: string;          // Building class code (determines Coop/Condo vs other)
  unitsRes: number;               // Total residential units (for RGB Study size bucket)
  yearBuilt: number;              // Construction year (for era determination)
  borough: string;                // Borough name (for location category)
  communityDistrict?: number;     // Community district (for Manhattan subcategories)
  numFloors: number;              // Number of floors (for rent stabilization heuristics)
  
  // Financial data
  buildingValue: number;
  capRate: number;
  totalRetrofitCost: number;
  annualEnergySavings?: number;
  upgradeYear?: number;           // Year when retrofit completes (default: 2025)
  
  // LL97 fee data (all periods) - needed for year-by-year calculations
  annualFeeExceedingBudget2024to2029?: number;
  annualFeeExceedingBudget2030to2034?: number;
  annualFeeExceedingBudget2035to2039?: number;
  annualFeeExceedingBudget2040to2049?: number;
  
  adjustedAnnualFeeBefore2027?: number;
  adjustedAnnualFee2027to2029?: number;
  adjustedAnnualFee2030to2034?: number;
  adjustedAnnualFee2035to2039?: number;
  adjustedAnnualFee2040to2049?: number;
  
  // Override parameters (from NOICalculationOverrides)
  customCurrentNOI?: number;
  rentIncreasePercentage?: number;
  utilitiesIncludedInRent?: boolean;
  operatingExpenseRatio?: number;
  vacancyRate?: number;
  noiAnnualGrowthRate?: number;           // Default: 0.03 (3% annual growth for inflation/appreciation)
}

// 6. Property Value Service Input (Section 10)
export interface PropertyValueCalculationInput extends BaseServiceInput {
  // NOI data from NOI service (year-by-year arrays)
  noiByYearNoUpgrade: Array<{year: number, noi: number}>;
  noiByYearWithUpgrade: Array<{year: number, noi: number}>;
  
  // Overridable property value parameters
  capRate?: number;                          // Default: 0.04 (4%)
}

// Union type for all service inputs
export type ServiceInput = 
  | AIUnitBreakdownInput
  | EnergyCalculationInput
  | LL97CalculationInput
  | FinancialCalculationInput
  | NOICalculationInput
  | PropertyValueCalculationInput;

// Service name mapping
export type ServiceName = 
  | 'ai-breakdown'
  | 'energy' 
  | 'll97'
  | 'financial'
  | 'noi'
  | 'property-value';

// Helper type to extract input type by service name
export type ServiceInputByName<T extends ServiceName> = 
  T extends 'ai-breakdown' ? AIUnitBreakdownInput :
  T extends 'energy' ? EnergyCalculationInput :
  T extends 'll97' ? LL97CalculationInput :
  T extends 'financial' ? FinancialCalculationInput :
  T extends 'noi' ? NOICalculationInput :
  T extends 'property-value' ? PropertyValueCalculationInput :
  never;

// Helper function to build input from database calculation record
export function buildServiceInput<T extends ServiceName>(
  serviceName: T,
  calculation: Calculations,
  overrides?: Partial<ServiceInputByName<T>>
): ServiceInputByName<T> {
  const baseInput = {
    calculationId: calculation.id,
  };
  
  // This would be implemented with service-specific logic
  // For now, return base input with type assertion
  return { ...baseInput, ...overrides } as ServiceInputByName<T>;
}