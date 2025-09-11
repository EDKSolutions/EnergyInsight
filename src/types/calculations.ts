export interface Calculations {
  calculations: Calculation[];
}

export interface Calculation {
  calculation: {
    id: string;
    bbl: string;
    address: string;
    yearBuilt: number;
    annualEnergy: string;
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
    annualBuildingCostPTAC: string;
    annualBuildingCostPTHP: string;
    annualBuildingkWhCoolingPTAC: string;
    annualBuildingkWhCoolingPTHP: string;
    annualBuildingkWhHeatingPTHP: string;
    annualBuildingMMBtuCoolingPTAC: string;
    annualBuildingMMBtuCoolingPTHP: string;
    annualBuildingMMBtuHeatingPTAC: string;
    annualBuildingMMBtuHeatingPTHP: string;
    annualBuildingMMBtuTotalPTAC: string;
    annualBuildingMMBtuTotalPTHP: string;
    annualBuildingThermsHeatingPTAC: string;
    annualEnergySavings: string;
    totalRetrofitCost: string;
    [key: string]: string | number | unknown[];
  }
} 
