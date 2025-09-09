/**
 * Financial Analysis Constants
 * Based on LaTeX Document Section 8 - Financial Analysis
 */

// Default Loan Parameters
export const LOAN_CONSTANTS = {
  defaultLoanTermYears: 15,        // Default loan term in years
  defaultAnnualInterestRate: 0.06, // Default annual interest rate (6%)
  defaultCapRate: 0.04,            // Default cap rate for property valuation (4%)
} as const;

// Analysis Time Periods
export const ANALYSIS_PERIODS = {
  analysisStartYear: 2024,  // Start year for financial analysis
  analysisEndYear: 2050,    // End year for financial analysis (26-year period)
  upgradeYear: 2025,        // Default year when upgrade completes
  savingsStartYear: 2026,   // Year when savings begin (after upgrade completion)
} as const;

// Financial Analysis Configuration Interface
export interface FinancialAnalysisConfig {
  loanTermYears: number;
  annualInterestRate: number;
  capRate: number;
  analysisStartYear: number;
  analysisEndYear: number;
  upgradeYear: number;
  savingsStartYear: number;
}

// Default Financial Configuration
export const defaultFinancialConfig: FinancialAnalysisConfig = {
  ...LOAN_CONSTANTS,
  ...ANALYSIS_PERIODS,
};

/**
 * Calculate monthly loan payment using standard amortization formula
 * Formula: P × [r(1+r)^n] / [(1+r)^n-1]
 * 
 * @param principal - Loan principal amount
 * @param annualRate - Annual interest rate as decimal
 * @param termYears - Loan term in years
 * @returns Monthly payment amount
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  const monthlyRate = annualRate / 12;
  const totalPayments = termYears * 12;
  
  if (monthlyRate === 0) {
    // Handle zero interest rate case
    return principal / totalPayments;
  }
  
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
         (Math.pow(1 + monthlyRate, totalPayments) - 1);
}

/**
 * Calculate remaining loan balance after t years
 * Formula: P × [(1+r)^n-(1+r)^(mt)] / [(1+r)^n-1]
 * 
 * @param principal - Original loan principal
 * @param annualRate - Annual interest rate as decimal
 * @param termYears - Total loan term in years
 * @param yearsElapsed - Years elapsed since loan start
 * @returns Remaining loan balance
 */
export function calculateRemainingBalance(
  principal: number,
  annualRate: number,
  termYears: number,
  yearsElapsed: number
): number {
  if (yearsElapsed >= termYears) return 0;
  
  const monthlyRate = annualRate / 12;
  const totalPayments = termYears * 12;
  const paymentsElapsed = yearsElapsed * 12;
  
  if (monthlyRate === 0) {
    // Handle zero interest rate case
    return principal * (1 - yearsElapsed / termYears);
  }
  
  return principal * 
         (Math.pow(1 + monthlyRate, totalPayments) - Math.pow(1 + monthlyRate, paymentsElapsed)) /
         (Math.pow(1 + monthlyRate, totalPayments) - 1);
}

/**
 * Generate array of loan balances by year
 * 
 * @param principal - Loan principal amount
 * @param config - Financial analysis configuration
 * @returns Array of remaining loan balance for each year
 */
export function generateLoanBalanceArray(
  principal: number,
  config: FinancialAnalysisConfig
): number[] {
  const years = generateAnalysisYears(config);
  const startYear = config.upgradeYear; // Loan starts when upgrade completes
  
  return years.map(year => {
    const yearsElapsed = year - startYear;
    if (yearsElapsed < 0) return 0; // No loan yet
    
    return calculateRemainingBalance(
      principal,
      config.annualInterestRate,
      config.loanTermYears,
      yearsElapsed
    );
  });
}

/**
 * Calculate simple payback period from cumulative savings array
 * 
 * @param retrofitCost - Total retrofit cost
 * @param cumulativeSavings - Array of cumulative savings by year
 * @returns Year when payback is achieved, or -1 if not achieved
 */
export function calculateSimplePaybackPeriod(
  retrofitCost: number,
  cumulativeSavings: number[]
): number {
  const startYear = ANALYSIS_PERIODS.savingsStartYear;
  
  for (let i = 0; i < cumulativeSavings.length; i++) {
    if (cumulativeSavings[i] >= retrofitCost) {
      return startYear + i;
    }
  }
  
  return -1; // Payback not achieved within analysis period
}

/**
 * Generate array of analysis years
 * 
 * @param config - Financial analysis configuration
 * @returns Array of years for analysis
 */
export function generateAnalysisYears(config: FinancialAnalysisConfig): number[] {
  const years: number[] = [];
  for (let year = config.analysisStartYear; year <= config.analysisEndYear; year++) {
    years.push(year);
  }
  return years;
}

// Combined export for easy access
export const FINANCIAL_CONSTANTS = {
  ...LOAN_CONSTANTS,
  ...ANALYSIS_PERIODS,
} as const;

// Type for financial constant keys
export type FinancialConstantKey = keyof typeof FINANCIAL_CONSTANTS;