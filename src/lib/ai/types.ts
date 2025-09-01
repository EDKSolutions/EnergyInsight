
export interface PlutoRecord {
  bldgclass: string; // Building Class Code (e.g., C1, D3, R1, etc.)
  resarea: number; // Residential Floor Area in sq ft
  unitsres: number; // Total number of residential units
  unitstotal?: number; // Total number of all units (res + commercial)
  boro: string; // Borough code: MN, BK, QN, BX, SI
  lotarea?: number; // Area of the tax lot in sq ft
  bldgarea?: number; // Total building floor area in sq ft
  yearbuilt?: number; // Year the building was built
  landuse?: string; // Land use category (01 = 1-2 fam, 02 = multi-fam, etc.)
  numfloors?: number; // Number of floors for the tallest building
  lotdepth?: number;
  lotfront?: number;
  zip?: string;
  address?: string;
  zone?: string;
  ownername?: string;
}

export interface UnitBreakdown {
  studio: number;
  one_bed: number;
  two_bed: number;
  three_plus: number;
  source: 'AI-Assumed';
}

export interface UnitBreakdownResult {
  algorithm: string;
  notes: string;
  graphVersion?: string;
  runTimestamp?: string;
  unitBreakdown: UnitBreakdown;
  ptacUnits: number;
  numberOfBedrooms: number;

  // Section 2.2 - Building-Level PTAC Calculations (matching LaTeX)
  annualBuildingMMBtuCoolingPTAC: number;
  annualBuildingMMBtuHeatingPTAC: number;
  annualBuildingMMBtuTotalPTAC: number;

  // Section 3 - PTHP Building Calculations (matching LaTeX)
  annualBuildingMMBtuHeatingPTHP: number;
  annualBuildingMMBtuCoolingPTHP: number;
  annualBuildingMMBtuTotalPTHP: number;

  // Section 4 - Energy Reduction Analysis (matching LaTeX)
  energyReductionPercentage: number;

  // Section 5 - Retrofit Cost Calculation (matching LaTeX)
  totalRetrofitCost: number;

  // Section 6 - Energy Cost Savings Calculation (matching LaTeX)
  annualBuildingThermsHeatingPTAC: number;
  annualBuildingKwhCoolingPTAC: number;
  annualBuildingKwhHeatingPTHP: number;
  annualBuildingKwhCoolingPTHP: number;
  annualBuildingCostPTAC: number;
  annualBuildingCostPTHP: number;
  annualEnergySavings: number;

  // Building Values (from LL84 data or defaults)
  capRate: string;
  buildingValue: string;
  siteEUI: string;
  occupancyRate: string;
  maintenanceCost: string;
  energyProfile: string;
}

export interface AIServiceInterface {
  analyzeUnitBreakdown(plutoData: PlutoRecord): Promise<UnitBreakdownResult>;
  analyzeBatchUnitBreakdown(limit?: number): Promise<{
    graphVersion: string;
    experimentName: string;
    timestamp: string;
  }>;
}
