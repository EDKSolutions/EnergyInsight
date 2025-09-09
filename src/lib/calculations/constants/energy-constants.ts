/**
 * Energy Calculation Constants
 * Based on LaTeX Document Sections 2-6
 */

// Section 2.1 - Per-Unit Constants (PTAC)
export const PTAC_CONSTANTS = {
  // Original unit values
  annualUnitThermsHeatingPTAC: 255, // therms per year per unit for heating
  annualUnitKwhCoolingPTAC: 16000, // kWh per year per unit for cooling
  
  // MMBtu equivalents (converted from original units)
  annualUnitMMBtuHeatingPTAC: 25.5, // 255 therms × 0.1 MMBtu/therm
  annualUnitMMBtuCoolingPTAC: 5.459427, // 16,000 kWh × 0.003412 MMBtu/kWh
} as const;

// Section 3 - PTHP Constants
export const PTHP_CONSTANTS = {
  heatingCapacityPTHP: 8, // KBtu heating capacity per PTHP unit
  pthpCOP: 1.51, // Coefficient of Performance for PTHP
} as const;

// Conversion Factors
export const CONVERSION_FACTORS = {
  kwhToMMBtu: 0.003412, // kWh to MMBtu conversion
  thermsToMMBtu: 0.1, // therms to MMBtu conversion  
  KBtuToKW: 3.412, // KBtu to kW conversion (kW per KBtu)
} as const;

// Section 5 - Retrofit Cost Constants
export const RETROFIT_COST_CONSTANTS = {
  pthpUnitCost: 1100, // Cost per PTHP unit in dollars
  pthpInstallationCost: 450, // Installation cost per unit in dollars
  pthpContingency: 0.10, // 10% contingency multiplier
} as const;

// Section 6 - Energy Cost Constants (NYC averages)
export const ENERGY_COST_CONSTANTS = {
  priceKwhHour: 0.24, // Electricity price per kWh in dollars
  priceThermHour: 1.45, // Natural gas price per therm in dollars
  // Note: Heating oil is $2.60-$2.77 per therm, but most buildings use natural gas
} as const;

// Combined export for easy access
export const ENERGY_CONSTANTS = {
  ...PTAC_CONSTANTS,
  ...PTHP_CONSTANTS,
  ...CONVERSION_FACTORS,
  ...RETROFIT_COST_CONSTANTS,
  ...ENERGY_COST_CONSTANTS,
} as const;

// Type for energy constant keys (for override validation)
export type EnergyConstantKey = keyof typeof ENERGY_CONSTANTS;

/**
 * Calculate EFLH from PLUTO data
 * Based on LaTeX Section 3 - Building-specific heating hours calculation
 */
export function getEFLHFromPluto(yearBuilt: number, numFloors: number): number {
  const buildingType = numFloors <= 6 ? 'lowRise' : 'highRise';
  const constructionEra = yearBuilt <= 1939 ? 'prewar' :
                         yearBuilt <= 1979 ? 'pre79' :
                         yearBuilt <= 2006 ? 'post1979' : 'post2007';

  const eflhTable = {
    lowRise: { prewar: 974, pre79: 738, post1979: 705, post2007: 491 },
    highRise: { prewar: 987, pre79: 513, post1979: 385, post2007: 214 }
  };
  
  return eflhTable[buildingType][constructionEra];
}

/**
 * Calculate annual building kWh heating for PTHP
 * Based on LaTeX Section 3.1.1 - PTHP heating energy calculation
 */
export function calculateAnnualBuildingkWhHeatingPTHP(
  ptacUnits: number,
  eflhHours: number,
  heatingCapacityPTHP: number,
  pthpCOP: number
): number {
  // Formula: (heatingCapacityPTHP / 3.412) × (1 / pthpCOP) × EFLH × ptacUnits
  return (heatingCapacityPTHP / CONVERSION_FACTORS.KBtuToKW) * 
         (1 / pthpCOP) * 
         eflhHours * 
         ptacUnits;
}