/**
 * EFLH (Equivalent Full Load Hours) Constants
 * Based on LaTeX Document Section 3 - PTHP System Calculations
 * 
 * EFLH values are used for building-specific PTHP heating calculations
 * and are derived from PLUTO data (year built and number of floors)
 */

// EFLH Lookup Table
export const EFLH_TABLE = {
  lowRise: {
    prewar: 974,    // ≤1939, ≤6 floors
    pre79: 738,     // 1940-1978, ≤6 floors  
    post1979: 705,  // 1979-2006, ≤6 floors
    post2007: 491,  // 2007+, ≤6 floors
  },
  highRise: {
    prewar: 987,    // ≤1939, >6 floors
    pre79: 513,     // 1940-1978, >6 floors
    post1979: 385,  // 1979-2006, >6 floors
    post2007: 214,  // 2007+, >6 floors
  },
} as const;

// Building classification thresholds
export const EFLH_CLASSIFICATION = {
  lowRiseMaxFloors: 6,        // Buildings with ≤6 floors are low-rise
  prewarMaxYear: 1939,        // Buildings built ≤1939 are prewar
  pre79MaxYear: 1978,         // Buildings built 1940-1978 are pre79
  post1979MaxYear: 2006,      // Buildings built 1979-2006 are post1979
  // Buildings built 2007+ are post2007
} as const;

/**
 * Get EFLH value from PLUTO building characteristics
 * Based on LaTeX Section 3.2.2 - Step 2: EFLH Lookup from PLUTO Data
 * 
 * @param yearBuilt - Building construction year from PLUTO
 * @param floors - Number of floors from PLUTO
 * @returns EFLH hours for heating calculations
 */
export function getEFLHFromPluto(yearBuilt: number, floors: number): number {
  // Determine building type (low-rise vs high-rise)
  const buildingType = floors <= EFLH_CLASSIFICATION.lowRiseMaxFloors ? 'lowRise' : 'highRise';
  
  // Determine construction era
  let constructionEra: keyof typeof EFLH_TABLE.lowRise;
  
  if (yearBuilt <= EFLH_CLASSIFICATION.prewarMaxYear) {
    constructionEra = 'prewar';
  } else if (yearBuilt <= EFLH_CLASSIFICATION.pre79MaxYear) {
    constructionEra = 'pre79';  
  } else if (yearBuilt <= EFLH_CLASSIFICATION.post1979MaxYear) {
    constructionEra = 'post1979';
  } else {
    constructionEra = 'post2007';
  }
  
  return EFLH_TABLE[buildingType][constructionEra];
}

/**
 * Calculate annual building kWh for PTHP heating using EFLH
 * Based on LaTeX Section 3.2.1 - Step 1: Calculate Annual Building kWh for PTHP Heating
 * 
 * Formula: (heatingCapacityPTHP / 3.412) × (1 / pthpCOP) × EFLH × N_ptacUnits
 * 
 * @param ptacUnits - Number of PTAC units to be replaced
 * @param eflhHours - EFLH hours from getEFLHFromPluto()
 * @param heatingCapacityPTHP - PTHP heating capacity in KBtu (default: 8)
 * @param pthpCOP - PTHP Coefficient of Performance (default: 1.51)
 * @returns Annual building kWh for PTHP heating
 */
export function calculateAnnualBuildingkWhHeatingPTHP(
  ptacUnits: number,
  eflhHours: number,
  heatingCapacityPTHP: number = 8,
  pthpCOP: number = 1.51
): number {
  return (heatingCapacityPTHP / 3.412) * (1 / pthpCOP) * eflhHours * ptacUnits;
}

// Type definitions for type safety
export type BuildingType = keyof typeof EFLH_TABLE;
export type ConstructionEra = keyof typeof EFLH_TABLE.lowRise;

/**
 * Get building type classification
 */
export function getBuildingType(floors: number): BuildingType {
  return floors <= EFLH_CLASSIFICATION.lowRiseMaxFloors ? 'lowRise' : 'highRise';
}

/**
 * Get construction era classification
 */
export function getConstructionEra(yearBuilt: number): ConstructionEra {
  if (yearBuilt <= EFLH_CLASSIFICATION.prewarMaxYear) return 'prewar';
  if (yearBuilt <= EFLH_CLASSIFICATION.pre79MaxYear) return 'pre79';
  if (yearBuilt <= EFLH_CLASSIFICATION.post1979MaxYear) return 'post1979';
  return 'post2007';
}