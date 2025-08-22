// src/types/calculation-result-type.ts

export interface CalculationResult {
  id: string;
  bbl: string;
  buildingName: string;
  address: string;
  yearBuilt: string;
  annualBuildingCostPTAC: string;
  annualBuildingCostPTHP: string;
  annualBuildingKwhCoolingPTAC: string;
  annualBuildingKwhCoolingPTHP: string;
  annualBuildingKwhHeatingPTHP: string;
  annualBuildingMMBtuCoolingPTAC: string;
  annualBuildingMMBtuCoolingPTHP: string;
  annualBuildingMMBtuHeatingPTAC: string;
  annualBuildingMMBtuHeatingPTHP: string;
  annualBuildingMMBtuTotalPTAC: string;
  annualBuildingMMBtuTotalPTHP: string;
  annualBuildingThermsHeatingPTAC: string;
  annualEnergySavings: string;
  totalRetrofitCost: string;
  boro: string;
  buildingClass: string;
  buildingValue: string;
  capRate: string;
  createdAt: string;
  energyProfile: string;
  maintenanceCost: string;
  occupancyRate: string;
  ptacUnits: string;
  rawLL84Data: unknown[];
  rawPlutoData: unknown[];
  siteEUI: string;
  stories: string;
  taxClass: string;
  totalResidentialUnits: string;
  totalSquareFeet: string;
  unitMixBreakDown: string;
  updatedAt: string;
  zoning: string;
  [key: string]: string | number | unknown[];
} 
