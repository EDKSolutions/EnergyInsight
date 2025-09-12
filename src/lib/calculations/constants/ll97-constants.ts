/**
 * LL97 (Local Law 97) Constants
 * Based on LaTeX Document Section 7
 */

// LL97 Fee Structure
export const LL97_FEE_CONSTANTS = {
  feePerTonCO2e: 268, // Fee per metric ton CO2e over budget ($268/tCO2e)
} as const;

// Emissions Factors
export const EMISSIONS_FACTORS = {
  efGas: 0.05311, // Natural gas emissions factor (tCO₂e/MMBtu) - constant 2024-2034
  
  // Grid electricity emissions factors by period (tCO₂e/kWh)
  efGrid2024to2029: 0.000288962,
  efGrid2030to2034: 0.000145,
  efGrid2035to2039: 0.000145, // Same as 2030-2034 (conservative assumption)
  efGrid2040to2049: 0.000145, // Same as 2030-2034 (conservative assumption)
} as const;

// Beneficial Electrification (BE) Credit Coefficients
export const BE_CREDIT_CONSTANTS = {
  beCoefficientBefore2027: 0.0013, // BE credit coefficient before Jan 1, 2027 (tCO₂e/kWh)
  beCoefficient2027to2029: 0.00065, // BE credit coefficient 2027-2029 (tCO₂e/kWh)
  // Note: No BE credits available post-2029
} as const;

// Compliance Periods
export const COMPLIANCE_PERIODS = {
  period1: { start: 2024, end: 2029 },
  period2: { start: 2030, end: 2034 },
  period3: { start: 2035, end: 2039 },
  period4: { start: 2040, end: 2049 },
} as const;

// Building Type Categories for EFLH lookup
export const BUILDING_TYPES = {
  lowRiseThreshold: 6, // Buildings with ≤6 floors are low-rise
  // Buildings with >6 floors are high-rise
} as const;

// Construction Era Categories for EFLH lookup  
export const CONSTRUCTION_ERAS = {
  prewar: { maxYear: 1939 },
  pre79: { minYear: 1940, maxYear: 1978 },
  post1979: { minYear: 1979, maxYear: 2006 },
  post2007: { minYear: 2007 },
} as const;

/**
 * Get grid emissions factor for a specific year
 */
export function getGridEmissionsFactor(year: number): number {
  if (year >= 2024 && year <= 2029) return EMISSIONS_FACTORS.efGrid2024to2029;
  if (year >= 2030 && year <= 2034) return EMISSIONS_FACTORS.efGrid2030to2034;
  if (year >= 2035 && year <= 2039) return EMISSIONS_FACTORS.efGrid2035to2039;
  if (year >= 2040 && year <= 2049) return EMISSIONS_FACTORS.efGrid2040to2049;
  
  // Default to most recent factor for years beyond 2049
  return EMISSIONS_FACTORS.efGrid2040to2049;
}

/**
 * Get compliance period for a specific year
 */
export type CompliancePeriod = '2024-2029' | '2030-2034' | '2035-2039' | '2040-2049';

export function getCompliancePeriod(year: number): CompliancePeriod {
  if (year >= 2024 && year <= 2029) return '2024-2029';
  if (year >= 2030 && year <= 2034) return '2030-2034';
  if (year >= 2035 && year <= 2039) return '2035-2039';
  return '2040-2049'; // Default for years 2040+
}

/**
 * Get BE credit coefficient for a specific year
 */
export function getBECreditCoefficient(year: number): number {
  if (year < 2027) return BE_CREDIT_CONSTANTS.beCoefficientBefore2027;
  if (year >= 2027 && year <= 2029) return BE_CREDIT_CONSTANTS.beCoefficient2027to2029;
  return 0; // No BE credits available post-2029
}

// Combined export for easy access
export const LL97_CONSTANTS = {
  ...LL97_FEE_CONSTANTS,
  ...EMISSIONS_FACTORS,
  ...BE_CREDIT_CONSTANTS,
  ...BUILDING_TYPES,
  ...CONSTRUCTION_ERAS,
} as const;

// Type for LL97 constant keys
export type LL97ConstantKey = keyof typeof LL97_CONSTANTS;