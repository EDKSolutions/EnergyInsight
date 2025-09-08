/**
 * EFLH (Equivalent Full Load Hours) constants matching LaTeX document Section 3
 * These values are used for building-specific heating energy calculations
 */

// Section 3.2 - EFLH Table by Building Type and Construction Era
export const eflhTable = {
  lowRise: {
    prewar: 974,    // Built <= 1939, <= 6 floors
    pre79: 738,     // Built 1940-1978, <= 6 floors  
    post1979: 705,  // Built 1979-2006, <= 6 floors
    post2007: 491   // Built >= 2007, <= 6 floors
  },
  highRise: {
    prewar: 987,    // Built <= 1939, > 6 floors
    pre79: 513,     // Built 1940-1978, > 6 floors
    post1979: 385,  // Built 1979-2006, > 6 floors  
    post2007: 214   // Built >= 2007, > 6 floors
  }
} as const;

// Section 3.3 - PTHP Constants for EFLH Calculations
export const heatingCapacityPTHP = 8; // KBtu heating capacity per PTHP unit
export const kWperKBtu = 3.412; // Conversion factor from KBtu to kW
export const pthpCOP = 1.51; // Coefficient of Performance for PTHP

// Type definitions
export type BuildingType = 'lowRise' | 'highRise';
export type ConstructionEra = 'prewar' | 'pre79' | 'post1979' | 'post2007';

/**
 * Get EFLH from PLUTO data based on building characteristics
 * Matches the function in LaTeX document Section 3.2
 */
export function getEFLHFromPluto(yearBuilt: number, floors: number): number {
  const buildingType: BuildingType = floors <= 6 ? 'lowRise' : 'highRise';
  
  const constructionEra: ConstructionEra = yearBuilt <= 1939 ? 'prewar' :
                                          yearBuilt <= 1978 ? 'pre79' :
                                          yearBuilt <= 2006 ? 'post1979' : 'post2007';
  
  return eflhTable[buildingType][constructionEra];
}

/**
 * Calculate annual building kWh for PTHP heating using EFLH
 * Implements the detailed equation from LaTeX Section 3.1
 */
export function calculateAnnualBuildingkWhHeatingPTHP(
  ptacUnits: number, 
  eflhHours: number
): number {
  // Equation from LaTeX: (heatingCapacityPTHP / 3.412) × (1 / pthpCOP) × EFLH × N_ptacUnits
  const annualBuildingkWhHeatingPTHP = 
    (heatingCapacityPTHP / kWperKBtu) * 
    (1 / pthpCOP) * 
    eflhHours * 
    ptacUnits;
    
  return Math.round(annualBuildingkWhHeatingPTHP * 100) / 100; // Round to 2 decimals
}

/**
 * Helper function to categorize building for EFLH lookup
 */
export function getBuildingTypeFromFloors(floors: number): BuildingType {
  return floors <= 6 ? 'lowRise' : 'highRise';
}

/**
 * Helper function to categorize construction era for EFLH lookup  
 */
export function getConstructionEraFromYear(yearBuilt: number): ConstructionEra {
  if (yearBuilt <= 1939) return 'prewar';
  if (yearBuilt <= 1978) return 'pre79';
  if (yearBuilt <= 2006) return 'post1979';
  return 'post2007';
}

/**
 * Get all EFLH values for debugging/analysis
 */
export function getAllEFLHValues() {
  return {
    eflhTable,
    buildingTypes: ['lowRise', 'highRise'] as BuildingType[],
    constructionEras: ['prewar', 'pre79', 'post1979', 'post2007'] as ConstructionEra[],
    eflhRange: {
      min: Math.min(...Object.values(eflhTable.lowRise), ...Object.values(eflhTable.highRise)),
      max: Math.max(...Object.values(eflhTable.lowRise), ...Object.values(eflhTable.highRise))
    }
  };
}