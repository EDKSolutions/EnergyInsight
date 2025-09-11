// src/types/calculation-result-type.ts

export interface CalculationResult {
  id: string;
  bbl: string;
  address: string;
  yearBuilt: number;
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
  buildingValue: number;
  capRate: number;
  createdAt: string;
  ptacUnits: number;
  rawLL84Data: unknown[];
  rawPlutoData: unknown[];
  stories: number;
  totalResidentialUnits: number;
  totalSquareFeet: number;
  unitMixBreakDown: string;
  updatedAt: string;
  [key: string]: string | number | unknown[];
} 
