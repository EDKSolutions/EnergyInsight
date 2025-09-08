/**
 * Financial Analysis Service - Section 8
 * Implements financial analysis including payback calculations and loan modeling
 * Matches LaTeX document Section 8 exactly
 */

import {
  defaultLoanTermYears,
  defaultAnnualInterestRate,
  analysisStartYear,
  analysisEndYear,
  calculateMonthlyPayment,
  calculateRemainingBalance,
  generateLoanBalanceArray,
  calculateSimplePaybackPeriod,
  generateAnalysisYears,
  type FinancialAnalysisConfig,
  defaultFinancialConfig
} from '../constants/financial-constants';

export interface FinancialInput {
  // Basic financial data
  totalRetrofitCost: number;
  annualEnergySavings: number;
  
  // LL97 fee avoidance by period
  annualFeeExceedingBudget2024to2029: number;
  annualFeeExceedingBudget2030to2034: number;
  annualFeeExceedingBudget2035to2039: number;
  annualFeeExceedingBudget2040to2049: number;
  
  adjustedAnnualFeeBefore2027: number;
  adjustedAnnualFee2027to2029: number;
  adjustedAnnualFee2030to2034: number;
  adjustedAnnualFee2035to2039: number;
  adjustedAnnualFee2040to2049: number;
  
  // Configuration (optional)
  config?: Partial<FinancialAnalysisConfig>;
}

export interface FinancialResults {
  // LL97 Fee Avoidance calculations
  annualLL97FeeAvoidance2024to2027: number;
  annualLL97FeeAvoidance2027to2029: number;
  annualLL97FeeAvoidance2030to2034: number;
  annualLL97FeeAvoidance2035to2039: number;
  annualLL97FeeAvoidance2040to2049: number;
  
  // Payback analysis
  simplePaybackPeriod: number; // Year when payback is achieved
  cumulativeSavingsByYear: number[]; // Array of cumulative savings
  
  // Loan analysis
  loanBalanceByYear: number[];
  monthlyPayment: number;
  totalInterestPaid: number;
  
  // Analysis configuration used
  analysisConfig: FinancialAnalysisConfig;
}

export class FinancialCalculationService {
  /**
   * Calculate complete financial analysis
   * Implements LaTeX Section 8 calculations
   */
  calculateFinancialAnalysis(input: FinancialInput): FinancialResults {
    console.log('Calculating financial analysis with payback period');
    
    const config: FinancialAnalysisConfig = {
      ...defaultFinancialConfig,
      ...input.config
    };
    
    // Step 1: Calculate LL97 fee avoidance by period
    const feeAvoidance = this.calculateLL97FeeAvoidance(input);
    
    // Step 2: Calculate annual savings by year (varying by LL97 periods)
    const cumulativeSavingsByYear = this.calculateCumulativeSavingsByYear(
      input.annualEnergySavings, 
      feeAvoidance,
      config
    );
    
    // Step 3: Calculate simple payback period
    const simplePaybackPeriod = calculateSimplePaybackPeriod(
      input.totalRetrofitCost,
      cumulativeSavingsByYear
    );
    
    // Step 4: Calculate loan analysis
    const loanAnalysis = this.calculateLoanAnalysis(input.totalRetrofitCost, config);
    
    return {
      ...feeAvoidance,
      simplePaybackPeriod,
      cumulativeSavingsByYear,
      ...loanAnalysis,
      analysisConfig: config
    };
  }
  
  /**
   * Section 8.1 - Calculate LL97 Fee Avoidance
   * feeAvoidance = originalFee - adjustedFee
   */
  private calculateLL97FeeAvoidance(input: FinancialInput) {
    const annualLL97FeeAvoidance2024to2027 = this.roundTo2Decimals(
      input.annualFeeExceedingBudget2024to2029 - input.adjustedAnnualFeeBefore2027
    );
    
    const annualLL97FeeAvoidance2027to2029 = this.roundTo2Decimals(
      input.annualFeeExceedingBudget2024to2029 - input.adjustedAnnualFee2027to2029
    );
    
    const annualLL97FeeAvoidance2030to2034 = this.roundTo2Decimals(
      input.annualFeeExceedingBudget2030to2034 - input.adjustedAnnualFee2030to2034
    );
    
    const annualLL97FeeAvoidance2035to2039 = this.roundTo2Decimals(
      input.annualFeeExceedingBudget2035to2039 - input.adjustedAnnualFee2035to2039
    );
    
    const annualLL97FeeAvoidance2040to2049 = this.roundTo2Decimals(
      input.annualFeeExceedingBudget2040to2049 - input.adjustedAnnualFee2040to2049
    );
    
    return {
      annualLL97FeeAvoidance2024to2027,
      annualLL97FeeAvoidance2027to2029,
      annualLL97FeeAvoidance2030to2034,
      annualLL97FeeAvoidance2035to2039,
      annualLL97FeeAvoidance2040to2049
    };
  }
  
  /**
   * Section 8.2 - Calculate Cumulative Savings by Year
   * Implements the getAnnualSavings function from LaTeX
   */
  private calculateCumulativeSavingsByYear(
    energySavings: number,
    feeAvoidance: ReturnType<typeof this.calculateLL97FeeAvoidance>,
    config: FinancialAnalysisConfig
  ): number[] {
    const analysisYears = generateAnalysisYears(config.analysisStartYear, config.analysisEndYear);
    const cumulativeSavings: number[] = [];
    let cumulative = 0;
    
    for (const year of analysisYears) {
      // Get annual savings for this specific year
      const annualSavings = this.getAnnualSavings(year, energySavings, feeAvoidance);
      
      // No savings in upgrade year (2025 example), savings begin after
      const actualSavings = year === config.analysisStartYear ? 0 : annualSavings;
      cumulative += actualSavings;
      
      cumulativeSavings.push(this.roundTo2Decimals(cumulative));
    }
    
    return cumulativeSavings;
  }
  
  /**
   * Get annual savings for a specific year based on LL97 compliance periods
   * Implements the getAnnualSavings function from LaTeX Section 8.2
   */
  private getAnnualSavings(
    year: number, 
    energySavings: number,
    feeAvoidance: ReturnType<typeof this.calculateLL97FeeAvoidance>
  ): number {
    if (year >= 2024 && year <= 2026) {
      return energySavings + feeAvoidance.annualLL97FeeAvoidance2024to2027;
    } else if (year >= 2027 && year <= 2029) {
      return energySavings + feeAvoidance.annualLL97FeeAvoidance2027to2029;
    } else if (year >= 2030 && year <= 2034) {
      return energySavings + feeAvoidance.annualLL97FeeAvoidance2030to2034;
    } else if (year >= 2035 && year <= 2039) {
      return energySavings + feeAvoidance.annualLL97FeeAvoidance2035to2039;
    } else {
      return energySavings + feeAvoidance.annualLL97FeeAvoidance2040to2049;
    }
  }
  
  /**
   * Section 8.3 - Calculate Loan Analysis
   * Includes monthly payment, remaining balance over time, and total interest
   */
  private calculateLoanAnalysis(
    principal: number, 
    config: FinancialAnalysisConfig
  ) {
    const monthlyRate = config.annualInterestRate / 12;
    const totalPayments = config.loanTermYears * 12;
    
    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyPayment(principal, monthlyRate, totalPayments);
    
    // Generate loan balance array over the analysis period
    const loanBalanceByYear = generateLoanBalanceArray(
      principal, 
      config.loanTermYears, 
      monthlyRate
    );
    
    // Calculate total interest paid
    const totalPaymentsAmount = monthlyPayment * totalPayments;
    const totalInterestPaid = this.roundTo2Decimals(totalPaymentsAmount - principal);
    
    return {
      loanBalanceByYear,
      monthlyPayment: this.roundTo2Decimals(monthlyPayment),
      totalInterestPaid
    };
  }
  
  /**
   * Generate visualization data for financial charts
   * Matches the LaTeX loan balance vs cumulative savings chart
   */
  generateVisualizationData(results: FinancialResults): {
    years: number[];
    loanBalance: number[];
    cumulativeSavings: number[];
    paybackYear: number;
    paybackAmount: number;
  } {
    const years = generateAnalysisYears(
      results.analysisConfig.analysisStartYear,
      Math.min(
        results.analysisConfig.analysisEndYear,
        results.analysisConfig.analysisStartYear + results.loanBalanceByYear.length - 1
      )
    );
    
    // Find payback point
    const paybackIndex = results.cumulativeSavingsByYear.findIndex(
      savings => savings >= results.loanBalanceByYear[0] // Initial loan amount
    );
    
    const paybackYear = paybackIndex >= 0 
      ? results.analysisConfig.analysisStartYear + paybackIndex
      : -1;
    
    const paybackAmount = paybackIndex >= 0 
      ? results.cumulativeSavingsByYear[paybackIndex]
      : 0;
    
    return {
      years,
      loanBalance: results.loanBalanceByYear.slice(0, years.length),
      cumulativeSavings: results.cumulativeSavingsByYear.slice(0, years.length),
      paybackYear,
      paybackAmount
    };
  }
  
  /**
   * Calculate financial metrics summary
   */
  calculateFinancialSummary(results: FinancialResults): {
    totalSavingsOverAnalysisPeriod: number;
    averageAnnualSavings: number;
    netPresentValue: number;
    paybackAchieved: boolean;
  } {
    const totalSavings = results.cumulativeSavingsByYear[results.cumulativeSavingsByYear.length - 1] || 0;
    const averageAnnualSavings = totalSavings / results.cumulativeSavingsByYear.length;
    
    // Simple NPV calculation (can be enhanced with proper discounting)
    const initialCost = results.loanBalanceByYear[0] || 0;
    const netPresentValue = totalSavings - initialCost;
    
    const paybackAchieved = results.simplePaybackPeriod > 0;
    
    return {
      totalSavingsOverAnalysisPeriod: this.roundTo2Decimals(totalSavings),
      averageAnnualSavings: this.roundTo2Decimals(averageAnnualSavings),
      netPresentValue: this.roundTo2Decimals(netPresentValue),
      paybackAchieved
    };
  }
  
  /**
   * Utility function to round to 2 decimal places
   */
  private roundTo2Decimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

// Export singleton instance
export const financialCalculationService = new FinancialCalculationService();