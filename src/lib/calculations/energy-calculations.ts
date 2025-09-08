/**
 * Energy calculation functions mapping to LaTeX document sections 2-6
 * Each function corresponds to specific sections in the LaTeX document
 */

import {
  annualUnitThermsHeatingPTAC,
  annualUnitKwhCoolingPTAC,
  annualUnitMMBtuHeatingPTAC,
  annualUnitMMBtuCoolingPTAC,
  coefficientOfPerformancePTHP,
  //annualUnitKwhCoolingPTHP,
  priceKwhHour,
  priceThermHour,
  pthpUnitCost,
  pthpInstallationCost,
  pthpContingency,
  //MMBTU_PER_THERM,
  KWH_PER_MMBTU,
} from './constants/energy-constants';

/**
 * Utility function to round numbers to 2 decimal places
 */
function roundTo2Decimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Section 2.2 - Building-Level PTAC Calculations
 * Calculates building totals for PTAC system based on number of units
 */
export function calculateSection2PTACBuilding(ptacUnits: number) {
  const annualBuildingMMBtuCoolingPTAC = roundTo2Decimals(
    ptacUnits * annualUnitMMBtuCoolingPTAC,
  );
  const annualBuildingMMBtuHeatingPTAC = roundTo2Decimals(
    ptacUnits * annualUnitMMBtuHeatingPTAC,
  );
  const annualBuildingMMBtuTotalPTAC = roundTo2Decimals(
    annualBuildingMMBtuCoolingPTAC + annualBuildingMMBtuHeatingPTAC,
  );

  return {
    annualBuildingMMBtuCoolingPTAC,
    annualBuildingMMBtuHeatingPTAC,
    annualBuildingMMBtuTotalPTAC,
  };
}

/**
 * Section 3 - PTHP System Calculations
 * Calculates PTHP energy based on PTAC baseline using COP
 */
export function calculateSection3PTHPEnergy(ptacMMBtu: {
  annualBuildingMMBtuHeatingPTAC: number;
  annualBuildingMMBtuCoolingPTAC: number;
}) {
  // Section 3.1 - Heating Energy Conversion using COP
  const annualBuildingMMBtuHeatingPTHP = roundTo2Decimals(
    ptacMMBtu.annualBuildingMMBtuHeatingPTAC / coefficientOfPerformancePTHP,
  );

  // Section 3.2 - Cooling Energy (same as PTAC)
  const annualBuildingMMBtuCoolingPTHP = roundTo2Decimals(
    ptacMMBtu.annualBuildingMMBtuCoolingPTAC,
  );

  // Section 3.3 - Total PTHP Energy
  const annualBuildingMMBtuTotalPTHP = roundTo2Decimals(
    annualBuildingMMBtuCoolingPTHP + annualBuildingMMBtuHeatingPTHP,
  );

  return {
    annualBuildingMMBtuHeatingPTHP,
    annualBuildingMMBtuCoolingPTHP,
    annualBuildingMMBtuTotalPTHP,
  };
}

/**
 * Section 4 - Energy Reduction Analysis
 * Calculates percentage energy reduction from PTAC to PTHP
 */
export function calculateSection4EnergyReduction(
  annualBuildingMMBtuTotalPTAC: number,
  annualBuildingMMBtuTotalPTHP: number,
) {
  const energyReductionPercentage = roundTo2Decimals(
    ((annualBuildingMMBtuTotalPTAC - annualBuildingMMBtuTotalPTHP) /
      annualBuildingMMBtuTotalPTAC) *
      100,
  );

  return {
    energyReductionPercentage,
  };
}

/**
 * Section 5 - Total Retrofit Cost Calculation
 * Calculates total cost for retrofitting from PTAC to PTHP
 */
export function calculateSection5RetrofitCost(ptacUnits: number) {
  const totalRetrofitCost = roundTo2Decimals(
    (pthpUnitCost + pthpInstallationCost) * ptacUnits * (1 + pthpContingency),
  );

  return {
    totalRetrofitCost,
  };
}

/**
 * Section 6 - Energy Cost Savings Calculation
 * Calculates building energy totals in original units and cost savings
 */
export function calculateSection6CostSavings(
  ptacUnits: number,
  ptacMMBtu: {
    annualBuildingMMBtuHeatingPTAC: number;
  },
) {
  // Building energy totals in original units for cost calculations
  const annualBuildingThermsHeatingPTAC = roundTo2Decimals(
    ptacUnits * annualUnitThermsHeatingPTAC,
  );
  const annualBuildingKwhCoolingPTAC = roundTo2Decimals(
    ptacUnits * annualUnitKwhCoolingPTAC,
  );

  // PTHP energy calculations
  const annualBuildingKwhHeatingPTHP = roundTo2Decimals(
    (ptacMMBtu.annualBuildingMMBtuHeatingPTAC / coefficientOfPerformancePTHP) *
      KWH_PER_MMBTU,
  );
  const annualBuildingKwhCoolingPTHP = roundTo2Decimals(
    annualBuildingKwhCoolingPTAC,
  ); // Same as PTAC

  // Cost calculations
  const annualBuildingCostPTAC = roundTo2Decimals(
    annualBuildingKwhCoolingPTAC * priceKwhHour +
      annualBuildingThermsHeatingPTAC * priceThermHour,
  );

  const annualBuildingCostPTHP = roundTo2Decimals(
    annualBuildingKwhHeatingPTHP * priceKwhHour +
      annualBuildingKwhCoolingPTHP * priceKwhHour,
  );

  const annualEnergySavings = roundTo2Decimals(
    annualBuildingCostPTAC - annualBuildingCostPTHP,
  );

  return {
    annualBuildingThermsHeatingPTAC,
    annualBuildingKwhCoolingPTAC,
    annualBuildingKwhHeatingPTHP,
    annualBuildingKwhCoolingPTHP,
    annualBuildingCostPTAC,
    annualBuildingCostPTHP,
    annualEnergySavings,
  };
}

/**
 * Main calculation function that orchestrates all sections
 * Calculates all energy metrics for a building with given PTAC units
 */
export function calculateAllEnergyMetrics(ptacUnits: number) {
  // Section 2 - PTAC Building Calculations
  const section2Results = calculateSection2PTACBuilding(ptacUnits);

  // Section 3 - PTHP Energy Calculations
  const section3Results = calculateSection3PTHPEnergy(section2Results);

  // Section 4 - Energy Reduction Analysis
  const section4Results = calculateSection4EnergyReduction(
    section2Results.annualBuildingMMBtuTotalPTAC,
    section3Results.annualBuildingMMBtuTotalPTHP,
  );

  // Section 5 - Retrofit Cost Calculation
  const section5Results = calculateSection5RetrofitCost(ptacUnits);

  // Section 6 - Cost Savings Calculation
  const section6Results = calculateSection6CostSavings(
    ptacUnits,
    section2Results,
  );

  return {
    ...section2Results,
    ...section3Results,
    ...section4Results,
    ...section5Results,
    ...section6Results,
  };
}
