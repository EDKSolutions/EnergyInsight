/**
 * Service Output Interfaces
 * Defines output types for all calculation services
 */

// Base interface for all service outputs
export interface BaseServiceOutput {
  calculationId: string;
  lastCalculated: Date;
  serviceVersion: string;
}

// 1. AI Unit Breakdown Service Output
export interface AIUnitBreakdownOutput extends BaseServiceOutput {
  unitBreakdown: {
    studio: number;
    one_bed: number;
    two_bed: number;
    three_plus: number;
  };
  ptacUnits: number;
  source: 'AI-Assumed' | 'User-Provided';
  reasoning: string;
  algorithm: string;
  notes: string;
}

// 2. Energy Calculation Service Output (Sections 2-6)
export interface EnergyCalculationOutput extends BaseServiceOutput {
  // EFLH calculation
  eflhHours: number;
  
  // Section 2.2 - PTAC calculations
  annualBuildingMMBtuCoolingPTAC: number;
  annualBuildingMMBtuHeatingPTAC: number;
  annualBuildingMMBtuTotalPTAC: number;
  annualBuildingThermsHeatingPTAC: number;
  annualBuildingKwhCoolingPTAC: number;
  annualBuildingCostPTAC: number;
  
  // Section 3 - PTHP calculations
  annualBuildingkWhHeatingPTHP: number;        // Using EFLH for accuracy
  annualBuildingMMBtuHeatingPTHP: number;
  annualBuildingMMBtuCoolingPTHP: number;
  annualBuildingMMBtuTotalPTHP: number;
  annualBuildingKwhCoolingPTHP: number;
  annualBuildingCostPTHP: number;
  
  // Section 4 - Energy reduction analysis
  energyReductionPercentage: number;
  
  // Section 5 - Retrofit cost calculation
  totalRetrofitCost: number;
  
  // Section 6 - Energy cost savings
  annualEnergySavings: number;
  
  // Configuration used for calculations (for transparency)
  configurationUsed: {
    ptacUnits: number;
    eflhHours: number;
    pthpCOP: number;
    priceKwhHour: number;
    priceThermHour: number;
    pthpUnitCost: number;
    pthpInstallationCost: number;
    pthpContingency: number;
  };
}

// 3. LL97 Service Output (Section 7)
export interface LL97CalculationOutput extends BaseServiceOutput {
  // Emissions budgets by period
  emissionsBudget2024to2029: number;
  emissionsBudget2030to2034: number;
  emissionsBudget2035to2039: number;
  emissionsBudget2040to2049: number;
  
  // Current building emissions
  totalBuildingEmissionsLL84: number;
  
  // Current fees (without upgrade)
  annualFeeExceedingBudget2024to2029: number;
  annualFeeExceedingBudget2030to2034: number;
  annualFeeExceedingBudget2035to2039: number;
  annualFeeExceedingBudget2040to2049: number;
  
  // BE Credits
  beCreditBefore2027: number;
  beCredit2027to2029: number;
  
  // Adjusted emissions (with upgrade)
  adjustedTotalBuildingEmissions2024to2029: number;
  adjustedTotalBuildingEmissions2030to2034: number;
  adjustedTotalBuildingEmissions2035to2039: number;
  adjustedTotalBuildingEmissions2040to2049: number;
  
  // Adjusted fees (with upgrade and BE credits)
  adjustedAnnualFeeBefore2027: number;
  adjustedAnnualFee2027to2029: number;
  adjustedAnnualFee2030to2034: number;
  adjustedAnnualFee2035to2039: number;
  adjustedAnnualFee2040to2049: number;
  
  // Analysis insights
  insights: {
    worstCaseFee: number;
    totalBECreditAvailable: number;
    complianceStatus: {
      '2024-2029': boolean;
      '2030-2034': boolean;
      '2035-2039': boolean;
      '2040-2049': boolean;
    };
  };
}

// 4. Financial Service Output (Section 8)
export interface FinancialCalculationOutput extends BaseServiceOutput {
  // LL97 Fee Avoidance calculations
  annualLL97FeeAvoidance2024to2027: number;
  annualLL97FeeAvoidance2027to2029: number;
  annualLL97FeeAvoidance2030to2034: number;
  annualLL97FeeAvoidance2035to2039: number;
  annualLL97FeeAvoidance2040to2049: number;
  
  // Payback analysis
  simplePaybackPeriod: number; // Year when payback is achieved (-1 if not achieved)
  cumulativeSavingsByYear: Array<{
    year: number;
    cumulativeSavings: number;
    annualSavings: number;
  }>; // Array of cumulative savings data with year information
  
  // Loan analysis
  loanBalanceByYear: Array<{
    year: number;
    balance: number;
  }>;
  monthlyPayment: number;
  totalInterestPaid: number;
  
  // Summary metrics
  summary: {
    averageAnnualSavings: number;
    totalSavingsOverAnalysisPeriod: number;
    netPresentValue: number;
    returnOnInvestment: number;
  };
  
  // Visualization data
  visualization: {
    analysisYears: number[];
    annualSavingsByYear: number[];
    loanBalanceByYear: Array<{
      year: number;
      balance: number;
    }>;
    cumulativeSavingsByYear: Array<{
      year: number;
      cumulativeSavings: number;
      annualSavings: number;
    }>;
  };
  
  // Configuration used
  analysisConfig: {
    loanTermYears: number;
    annualInterestRate: number;
    analysisStartYear: number;
    analysisEndYear: number;
    upgradeYear: number;
    loanStartYear: number;
  };
}

// 5. NOI Service Output (Section 9)
export interface NOICalculationOutput extends BaseServiceOutput {
  // Current NOI
  currentNOI: number;
  
  // NOI scenarios without upgrade
  noiNoUpgrade2024to2029: number;
  noiNoUpgrade2030to2034: number;
  noiNoUpgradePost2035: number;
  
  // NOI scenarios with upgrade
  noiWithUpgrade2024to2027: number;
  noiWithUpgrade2027to2029: number;
  noiWithUpgrade2030to2034: number;
  noiWithUpgradePost2035: number;
  
  // Analysis insights
  insights: {
    immediateNOIBoost: number;           // Year 1 NOI increase
    sustainedNOIGap: number;             // Long-term NOI advantage
    noiImprovementPercentage: number;    // Percentage improvement
    optimalUpgradeWindow: string;        // Recommended timing
  };
  
  // Data source information
  dataSource: {
    method: 'cooperative-api' | 'condominium-api' | 'rgb-study-fallback';
    rentStabilized: boolean;
    buildingCategory: string;
  };
}

// 6. Property Value Service Output (Section 10)
export interface PropertyValueCalculationOutput extends BaseServiceOutput {
  // Property values without upgrade
  propertyValueNoUpgrade: number;
  
  // Property values with upgrade
  propertyValueWithUpgrade: number;
  
  // Net property value impact
  netPropertyValueGain: number;
  
  // Analysis by time period
  valueAnalysis: {
    currentValue: number;
    upgradeValue: number;
    valueIncrease: number;
    valueIncreasePercentage: number;
  };
  
  // Investment metrics
  investmentMetrics: {
    valueToRetrofitCostRatio: number;    // Property value gain / retrofit cost
    equityCreated: number;               // Net equity increase
    leverageMultiplier: number;          // How much property value per dollar spent
  };
  
  // Configuration used
  capRateUsed: number;
}

// Union type for all service outputs
export type ServiceOutput = 
  | AIUnitBreakdownOutput
  | EnergyCalculationOutput
  | LL97CalculationOutput
  | FinancialCalculationOutput
  | NOICalculationOutput
  | PropertyValueCalculationOutput;

// Helper type to extract output type by service name
export type ServiceOutputByName<T extends import('./service-inputs').ServiceName> = 
  T extends 'ai-breakdown' ? AIUnitBreakdownOutput :
  T extends 'energy' ? EnergyCalculationOutput :
  T extends 'll97' ? LL97CalculationOutput :
  T extends 'financial' ? FinancialCalculationOutput :
  T extends 'noi' ? NOICalculationOutput :
  T extends 'property-value' ? PropertyValueCalculationOutput :
  never;

// Service execution result with metadata
export interface ServiceExecutionResult<T extends ServiceOutput = ServiceOutput> {
  success: boolean;
  output?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  executionTime: number; // milliseconds
  dependenciesTriggered?: string[];
}