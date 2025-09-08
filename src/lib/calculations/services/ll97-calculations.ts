/**
 * LL97 Calculations Service - Section 7
 * Implements Local Law 97 emissions calculations, BE credits, and fee calculations
 * Matches LaTeX document Section 7 exactly
 */

import {
  feePerTonCO2e,
  efGas,
  efGrid2024to2029,
  efGrid2030to2034,
  efGrid2035to2039,
  efGrid2040to2049,
  beCoefficientBefore2027,
  beCoefficient2027to2029,
  getEmissionsLimit,
  getGridEmissionsFactor,
  getCompliancePeriod,
  type CompliancePeriod
} from '../constants/ll97-constants';

export interface LL97Input {
  // Building characteristics
  buildingClass: string;
  totalSquareFeet: number;
  
  // Current emissions from LL84 data
  totalBuildingEmissionsLL84: number;
  
  // Energy calculations from previous steps
  annualBuildingMMBtuHeatingPTAC: number;
  annualBuildingkWhHeatingPTHP: number; // Using EFLH calculation
}

export interface LL97Results {
  // Emissions budgets by period
  emissionsBudget2024to2029: number;
  emissionsBudget2030to2034: number;
  emissionsBudget2035to2039: number;
  emissionsBudget2040to2049: number;
  
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
}

export class LL97CalculationService {
  /**
   * Calculate complete LL97 analysis
   * Implements all sections from LaTeX Section 7
   */
  calculateLL97Analysis(input: LL97Input): LL97Results {
    console.log('Calculating LL97 emissions analysis');
    
    // Step 1: Calculate emissions budgets for all periods
    const emissionsBudgets = this.calculateEmissionsBudgets(input);
    
    // Step 2: Calculate current fees (without upgrade)
    const currentFees = this.calculateCurrentFees(input, emissionsBudgets);
    
    // Step 3: Calculate BE Credits
    const beCredits = this.calculateBECredits(input);
    
    // Step 4: Calculate adjusted emissions (with upgrade)
    const adjustedEmissions = this.calculateAdjustedEmissions(input);
    
    // Step 5: Calculate adjusted fees (with upgrade and BE credits)
    const adjustedFees = this.calculateAdjustedFees(
      adjustedEmissions, 
      emissionsBudgets, 
      beCredits
    );
    
    return {
      ...emissionsBudgets,
      ...currentFees,
      ...beCredits,
      ...adjustedEmissions,
      ...adjustedFees
    };
  }
  
  /**
   * Section 7.1 - Calculate Emissions Budgets
   * emissionsBudget = squareFootage × emissionsLimit
   */
  private calculateEmissionsBudgets(input: LL97Input) {
    const { buildingClass, totalSquareFeet } = input;
    
    const emissionsBudget2024to2029 = this.roundTo2Decimals(
      totalSquareFeet * getEmissionsLimit(buildingClass, '2024to2029')
    );
    
    const emissionsBudget2030to2034 = this.roundTo2Decimals(
      totalSquareFeet * getEmissionsLimit(buildingClass, '2030to2034')
    );
    
    const emissionsBudget2035to2039 = this.roundTo2Decimals(
      totalSquareFeet * getEmissionsLimit(buildingClass, '2035to2039')
    );
    
    const emissionsBudget2040to2049 = this.roundTo2Decimals(
      totalSquareFeet * getEmissionsLimit(buildingClass, '2040to2049')
    );
    
    return {
      emissionsBudget2024to2029,
      emissionsBudget2030to2034,
      emissionsBudget2035to2039,
      emissionsBudget2040to2049
    };
  }
  
  /**
   * Section 7.2 - Calculate Current Fees (without upgrade)
   * annualFeeExceedingBudget = (totalEmissions - emissionsBudget) × feePerTon
   */
  private calculateCurrentFees(
    input: LL97Input, 
    budgets: ReturnType<typeof this.calculateEmissionsBudgets>
  ) {
    const { totalBuildingEmissionsLL84 } = input;
    
    const annualFeeExceedingBudget2024to2029 = Math.max(0, this.roundTo2Decimals(
      (totalBuildingEmissionsLL84 - budgets.emissionsBudget2024to2029) * feePerTonCO2e
    ));
    
    const annualFeeExceedingBudget2030to2034 = Math.max(0, this.roundTo2Decimals(
      (totalBuildingEmissionsLL84 - budgets.emissionsBudget2030to2034) * feePerTonCO2e
    ));
    
    const annualFeeExceedingBudget2035to2039 = Math.max(0, this.roundTo2Decimals(
      (totalBuildingEmissionsLL84 - budgets.emissionsBudget2035to2039) * feePerTonCO2e
    ));
    
    const annualFeeExceedingBudget2040to2049 = Math.max(0, this.roundTo2Decimals(
      (totalBuildingEmissionsLL84 - budgets.emissionsBudget2040to2049) * feePerTonCO2e
    ));
    
    return {
      annualFeeExceedingBudget2024to2029,
      annualFeeExceedingBudget2030to2034,
      annualFeeExceedingBudget2035to2039,
      annualFeeExceedingBudget2040to2049
    };
  }
  
  /**
   * Section 7.3 - Calculate BE Credits
   * beCredit = annualBuildingkWhHeatingPTHP × beCoefficient
   */
  private calculateBECredits(input: LL97Input) {
    const { annualBuildingkWhHeatingPTHP } = input;
    
    const beCreditBefore2027 = this.roundTo2Decimals(
      annualBuildingkWhHeatingPTHP * beCoefficientBefore2027
    );
    
    const beCredit2027to2029 = this.roundTo2Decimals(
      annualBuildingkWhHeatingPTHP * beCoefficient2027to2029
    );
    
    return {
      beCreditBefore2027,
      beCredit2027to2029
    };
  }
  
  /**
   * Section 7.4 - Calculate Adjusted Building Emissions
   * adjustedEmissions = baseEmissions - (gasMMBtu × gasEF) + (electricKwh × gridEF)
   */
  private calculateAdjustedEmissions(input: LL97Input) {
    const { 
      totalBuildingEmissionsLL84, 
      annualBuildingMMBtuHeatingPTAC, 
      annualBuildingkWhHeatingPTHP 
    } = input;
    
    // Remove gas emissions from baseline and add electric emissions for each period
    const adjustedTotalBuildingEmissions2024to2029 = this.roundTo2Decimals(
      totalBuildingEmissionsLL84 
      - (annualBuildingMMBtuHeatingPTAC * efGas)
      + (annualBuildingkWhHeatingPTHP * efGrid2024to2029)
    );
    
    const adjustedTotalBuildingEmissions2030to2034 = this.roundTo2Decimals(
      totalBuildingEmissionsLL84
      - (annualBuildingMMBtuHeatingPTAC * efGas)
      + (annualBuildingkWhHeatingPTHP * efGrid2030to2034)
    );
    
    const adjustedTotalBuildingEmissions2035to2039 = this.roundTo2Decimals(
      totalBuildingEmissionsLL84
      - (annualBuildingMMBtuHeatingPTAC * efGas)
      + (annualBuildingkWhHeatingPTHP * efGrid2035to2039)
    );
    
    const adjustedTotalBuildingEmissions2040to2049 = this.roundTo2Decimals(
      totalBuildingEmissionsLL84
      - (annualBuildingMMBtuHeatingPTAC * efGas)
      + (annualBuildingkWhHeatingPTHP * efGrid2040to2049)
    );
    
    return {
      adjustedTotalBuildingEmissions2024to2029,
      adjustedTotalBuildingEmissions2030to2034,
      adjustedTotalBuildingEmissions2035to2039,
      adjustedTotalBuildingEmissions2040to2049
    };
  }
  
  /**
   * Section 7.5 - Calculate Adjusted Fees (with upgrade and BE credits)
   */
  private calculateAdjustedFees(
    adjustedEmissions: ReturnType<typeof this.calculateAdjustedEmissions>,
    budgets: ReturnType<typeof this.calculateEmissionsBudgets>,
    beCredits: ReturnType<typeof this.calculateBECredits>
  ) {
    // 2024-2027: With higher BE credit
    const creditedEmissionsBefore2027 = 
      adjustedEmissions.adjustedTotalBuildingEmissions2024to2029 - beCredits.beCreditBefore2027;
    const adjustedAnnualFeeBefore2027 = Math.max(0, this.roundTo2Decimals(
      (creditedEmissionsBefore2027 - budgets.emissionsBudget2024to2029) * feePerTonCO2e
    ));
    
    // 2027-2029: With lower BE credit
    const creditedEmissions2027to2029 = 
      adjustedEmissions.adjustedTotalBuildingEmissions2024to2029 - beCredits.beCredit2027to2029;
    const adjustedAnnualFee2027to2029 = Math.max(0, this.roundTo2Decimals(
      (creditedEmissions2027to2029 - budgets.emissionsBudget2024to2029) * feePerTonCO2e
    ));
    
    // 2030-2034: No BE credit
    const adjustedAnnualFee2030to2034 = Math.max(0, this.roundTo2Decimals(
      (adjustedEmissions.adjustedTotalBuildingEmissions2030to2034 - budgets.emissionsBudget2030to2034) * feePerTonCO2e
    ));
    
    // 2035-2039: No BE credit
    const adjustedAnnualFee2035to2039 = Math.max(0, this.roundTo2Decimals(
      (adjustedEmissions.adjustedTotalBuildingEmissions2035to2039 - budgets.emissionsBudget2035to2039) * feePerTonCO2e
    ));
    
    // 2040-2049: No BE credit
    const adjustedAnnualFee2040to2049 = Math.max(0, this.roundTo2Decimals(
      (adjustedEmissions.adjustedTotalBuildingEmissions2040to2049 - budgets.emissionsBudget2040to2049) * feePerTonCO2e
    ));
    
    return {
      adjustedAnnualFeeBefore2027,
      adjustedAnnualFee2027to2029,
      adjustedAnnualFee2030to2034,
      adjustedAnnualFee2035to2039,
      adjustedAnnualFee2040to2049
    };
  }
  
  /**
   * Utility function to round to 2 decimal places
   */
  private roundTo2Decimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
  
  /**
   * Helper method to get emissions limit for a specific year
   */
  getEmissionsLimitForYear(buildingClass: string, year: number): number {
    const period = getCompliancePeriod(year);
    return getEmissionsLimit(buildingClass, period);
  }
  
  /**
   * Helper method to determine if BE credit applies for a given year
   */
  getBECreditForYear(year: number, annualBuildingkWhHeatingPTHP: number): number {
    if (year >= 2024 && year <= 2026) {
      return this.roundTo2Decimals(annualBuildingkWhHeatingPTHP * beCoefficientBefore2027);
    } else if (year >= 2027 && year <= 2029) {
      return this.roundTo2Decimals(annualBuildingkWhHeatingPTHP * beCoefficient2027to2029);
    }
    return 0; // No BE credit after 2029
  }
}

// Export singleton instance
export const ll97CalculationService = new LL97CalculationService();