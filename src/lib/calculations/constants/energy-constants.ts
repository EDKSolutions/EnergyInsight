/**
 * Energy calculation constants matching LaTeX document variable names
 * These values are derived from the LaTeX document sections 2-6
 */

// Section 2.1 - Per-Unit Constants (PTAC)
export const annualUnitThermsHeatingPTAC = 255; // therms per year per unit for heating
export const annualUnitKwhCoolingPTAC = 16000; // kWh per year per unit for cooling
export const annualUnitMMBtuHeatingPTAC = 25.5; // MMBtu per year per unit for heating (255 × 0.1)
export const annualUnitMMBtuCoolingPTAC = 5.459427; // MMBtu per year per unit for cooling (16,000 × 0.003412)

// Section 3 - PTHP Constants
export const coefficientOfPerformancePTHP = 3.5; // COP for heat pump
export const annualUnitKwhCoolingPTHP = 16000; // Same as PTAC cooling (kWh per year per unit)

// Section 6 - Price Constants (NYC averages)
export const priceKwhHour = 0.25; // $ per kWh for electricity
export const priceThermHour = 1.45; // $ per therm for gas

// Section 5 - Retrofit Cost Constants
export const pthpUnitCost = 1100; // $ per PTHP unit
export const pthpInstallationCost = 450; // $ per unit installation
export const pthpContingency = 0.1; // 10% contingency multiplier

// Conversion factors
export const MMBTU_PER_THERM = 0.1; // MMBtu per therm
export const MMBTU_PER_KWH = 0.003412; // MMBtu per kWh
export const KWH_PER_MMBTU = 293.1; // kWh per MMBtu
