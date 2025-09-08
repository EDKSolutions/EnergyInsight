/**
 * LL97 (Local Law 97) constants matching LaTeX document Section 7
 * These values are from the LL97 emissions limits and fee structures
 */

// Section 7.1 - LL97 Fee Structure
export const feePerTonCO2e = 268; // $ per tCO2e over budget

// Section 7.2 - Emissions Factors (tCO2e/unit)
export const efGas = 0.05311; // tCO2e/MMBtu for natural gas (constant 2024-2034)

// Grid electricity emissions factors by period (tCO2e/kWh)
export const efGrid2024to2029 = 0.000288962; // 2024-2029 period
export const efGrid2030to2034 = 0.000145; // 2030-2034 period
export const efGrid2035to2039 = 0.000145; // 2035-2039 period (assumed same as 2030-2034)
export const efGrid2040to2049 = 0.000145; // 2040-2049 period (assumed same as 2030-2034)

// Section 7.3 - BE Credit Coefficients (tCO2e/kWh)
export const beCoefficientBefore2027 = 0.0013; // Before January 1, 2027
export const beCoefficient2027to2029 = 0.00065; // 2027-2029 period

// Section 7.4 - LL97 Emissions Limits by Property Type and Period (tCO2e/sf)
// Key property types with their emissions limits across compliance periods
export const emissionsLimits = {
  // Office buildings
  office: {
    '2024to2029': 0.00846,
    '2030to2034': 0.00453,
    '2035to2039': 0.00165234,
    '2040to2049': 0.000581893
  },
  // Multifamily Housing
  multifamily: {
    '2024to2029': 0.00892,
    '2030to2034': 0.00453,
    '2035to2039': 0.00165234,
    '2040to2049': 0.000581893
  },
  // Hospital
  hospital: {
    '2024to2029': 0.02551,
    '2030to2034': 0.01542,
    '2035to2039': 0.00165234,
    '2040to2049': 0.000581893
  },
  // Residential (default for most residential buildings)
  residential: {
    '2024to2029': 0.00892,
    '2030to2034': 0.00453,
    '2035to2039': 0.00165234,
    '2040to2049': 0.000581893
  }
} as const;

// Property type mapping from building class to emissions category
export const buildingClassToPropertyType = {
  // Residential building classes
  'R1': 'residential',
  'R2': 'residential', 
  'R3': 'residential',
  'R4': 'residential',
  'R5': 'residential',
  'R6': 'residential',
  'R7': 'residential',
  'R8': 'residential',
  'R9': 'residential',
  'C0': 'residential',
  'C1': 'residential',
  'C2': 'residential',
  'C3': 'residential',
  'C4': 'residential',
  'C5': 'residential',
  'C6': 'residential',
  'C7': 'residential',
  'C8': 'residential',
  'C9': 'residential',
  'D1': 'residential',
  'D2': 'residential',
  'D3': 'residential',
  'D4': 'residential',
  'D5': 'residential',
  'D6': 'residential',
  'D7': 'residential',
  'D8': 'residential',
  'D9': 'residential',
  // Default to multifamily for unknown residential types
  'default': 'multifamily'
} as const;

// Type definitions for period keys
export type CompliancePeriod = '2024to2029' | '2030to2034' | '2035to2039' | '2040to2049';
export type PropertyType = keyof typeof emissionsLimits;
export type BuildingClass = keyof typeof buildingClassToPropertyType;

// Helper function to get emissions limit for a building class and period
export function getEmissionsLimit(buildingClass: string, period: CompliancePeriod): number {
  const normalizedClass = buildingClass.toUpperCase();
  const propertyType = buildingClassToPropertyType[normalizedClass as BuildingClass] || 
                      buildingClassToPropertyType.default;
  
  return emissionsLimits[propertyType][period];
}

// Helper function to get grid emissions factor by year
export function getGridEmissionsFactor(year: number): number {
  if (year >= 2024 && year <= 2029) {
    return efGrid2024to2029;
  } else if (year >= 2030 && year <= 2034) {
    return efGrid2030to2034;
  } else if (year >= 2035 && year <= 2039) {
    return efGrid2035to2039;
  } else {
    return efGrid2040to2049;
  }
}

// Helper function to get compliance period from year
export function getCompliancePeriod(year: number): CompliancePeriod {
  if (year >= 2024 && year <= 2029) {
    return '2024to2029';
  } else if (year >= 2030 && year <= 2034) {
    return '2030to2034';
  } else if (year >= 2035 && year <= 2039) {
    return '2035to2039';
  } else {
    return '2040to2049';
  }
}