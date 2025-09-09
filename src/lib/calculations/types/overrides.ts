/**
 * Override Types
 * Defines types for parameter overrides in service calculations
 */

import {
  AIUnitBreakdownInput,
  EnergyCalculationInput,
  LL97CalculationInput,
  FinancialCalculationInput,
  NOICalculationInput,
  PropertyValueCalculationInput,
  ServiceName
} from './service-inputs';

// Override types for each service (exclude required fields that shouldn't be overridden)
export interface AIUnitBreakdownOverrides {
  // AI service typically doesn't have user-overridable parameters
  // The unit breakdown is either AI-determined or user-provided as a whole
  unitBreakdown?: {
    studio: number;
    one_bed: number;
    two_bed: number;
    three_plus: number;
  };
  source?: 'User-Provided'; // Can override to user-provided
}

export interface EnergyCalculationOverrides {
  // Override any energy constants or parameters
  ptacUnits?: number;                        // Override AI-calculated PTAC units
  annualUnitThermsHeatingPTAC?: number;      // Override PTAC heating consumption
  annualUnitKwhCoolingPTAC?: number;         // Override PTAC cooling consumption
  annualUnitMMBtuHeatingPTAC?: number;       // Override PTAC heating MMBtu
  annualUnitMMBtuCoolingPTAC?: number;       // Override PTAC cooling MMBtu
  heatingCapacityPTHP?: number;              // Override PTHP heating capacity
  pthpCOP?: number;                          // Override PTHP efficiency
  pthpUnitCost?: number;                     // Override PTHP unit cost
  pthpInstallationCost?: number;             // Override installation cost
  pthpContingency?: number;                  // Override contingency percentage
  priceKwhHour?: number;                     // Override electricity price
  priceThermHour?: number;                   // Override gas price
}

export interface LL97CalculationOverrides {
  // Override LL97 parameters
  totalBuildingEmissionsLL84?: number;       // Override current emissions
  feePerTonCO2e?: number;                    // Override LL97 fee rate
  efGas?: number;                            // Override gas emissions factor
  efGrid2024to2029?: number;                 // Override grid emissions factor
  efGrid2030to2034?: number;                 // Override grid emissions factor
  beCoefficientBefore2027?: number;          // Override BE credit coefficient
  beCoefficient2027to2029?: number;          // Override BE credit coefficient
  // Building characteristics could be overridden if needed
  buildingClass?: string;
  totalSquareFeet?: number;
}

export interface FinancialCalculationOverrides {
  // Override financial parameters
  totalRetrofitCost?: number;                // Override calculated retrofit cost
  annualEnergySavings?: number;              // Override calculated energy savings
  loanPrincipal?: number;                    // Override loan principal (defaults to totalRetrofitCost)
  loanTermYears?: number;                    // Override loan term
  annualInterestRate?: number;               // Override interest rate
  analysisStartYear?: number;                // Override analysis start year
  analysisEndYear?: number;                  // Override analysis end year
  upgradeYear?: number;                      // Override when upgrade happens
  loanStartYear?: number;                    // Override when loan starts
}

export interface NOICalculationOverrides {
  // Override NOI parameters
  overrideCurrentNOI?: number;               // Override calculated current NOI
  // Could add overrides for RGB study parameters if needed
}

export interface PropertyValueCalculationOverrides {
  // Override property value parameters
  capRate?: number;                          // Override cap rate for valuation
}

// Union type for all overrides
export type ServiceOverrides = 
  | AIUnitBreakdownOverrides
  | EnergyCalculationOverrides
  | LL97CalculationOverrides
  | FinancialCalculationOverrides
  | NOICalculationOverrides
  | PropertyValueCalculationOverrides;

// Helper type to get override type by service name
export type ServiceOverridesByName<T extends ServiceName> = 
  T extends 'ai-breakdown' ? AIUnitBreakdownOverrides :
  T extends 'energy' ? EnergyCalculationOverrides :
  T extends 'll97' ? LL97CalculationOverrides :
  T extends 'financial' ? FinancialCalculationOverrides :
  T extends 'noi' ? NOICalculationOverrides :
  T extends 'property-value' ? PropertyValueCalculationOverrides :
  never;

// Combined override object for multiple services
export interface MultiServiceOverrides {
  'ai-breakdown'?: AIUnitBreakdownOverrides;
  'energy'?: EnergyCalculationOverrides;
  'll97'?: LL97CalculationOverrides;
  'financial'?: FinancialCalculationOverrides;
  'noi'?: NOICalculationOverrides;
  'property-value'?: PropertyValueCalculationOverrides;
}

// Request body interface for PUT endpoints
export interface ServiceUpdateRequest<T extends ServiceName = ServiceName> {
  overrides?: ServiceOverridesByName<T>;
  cascade?: boolean; // Whether to trigger dependent services
  notes?: string; // Optional notes about why override was made
}

// Override tracking for database storage
export interface OverrideMetadata {
  fieldName: string;
  originalValue: number | string | boolean | null;
  overriddenValue: number | string | boolean;
  overriddenAt: Date;
  overriddenBy: string; // user ID or system
  reason?: string;
}

// Override validation result
export interface OverrideValidationResult {
  valid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
  warnings: {
    field: string;
    message: string;
  }[];
}

// Helper functions for override handling
export function validateOverrides<T extends ServiceName>(
  serviceName: T,
  overrides: ServiceOverridesByName<T>
): OverrideValidationResult {
  const result: OverrideValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };
  
  // Service-specific validation logic would be implemented here
  // For example, checking ranges, required relationships, etc.
  
  return result;
}

export function mergeOverrides<T extends ServiceName>(
  serviceName: T,
  baseInput: Record<string, string | number>,
  overrides?: ServiceOverridesByName<T>
): Record<string, string | number> {
  if (!overrides) return baseInput;
  
  // Deep merge overrides with base input
  return { ...baseInput, ...overrides };
}

// Type guard functions
export function isEnergyOverrides(overrides: ServiceOverrides): overrides is EnergyCalculationOverrides {
  return 'ptacUnits' in overrides || 'pthpCOP' in overrides || 'priceKwhHour' in overrides;
}

export function isLL97Overrides(overrides: ServiceOverrides): overrides is LL97CalculationOverrides {
  return 'feePerTonCO2e' in overrides || 'totalBuildingEmissionsLL84' in overrides;
}

export function isFinancialOverrides(overrides: ServiceOverrides): overrides is FinancialCalculationOverrides {
  return 'loanTermYears' in overrides || 'annualInterestRate' in overrides;
}