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

// Standard Analysis Period Configuration
export const STANDARD_ANALYSIS_PERIOD = {
  analysisYears: 20,
  getCurrentYear: () => new Date().getFullYear(),
  getAnalysisYears: () => {
    const currentYear = new Date().getFullYear();
    return Array.from({length: 20}, (_, i) => currentYear + i);
  },
  getAnalysisStartYear: () => new Date().getFullYear(),
  getAnalysisEndYear: () => new Date().getFullYear() + 19,
} as const;

// Analysis Time Periods (Legacy - use STANDARD_ANALYSIS_PERIOD for new code)
export const ANALYSIS_PERIODS = {
  analysisStartYear: 2024,  // Start year for financial analysis
  analysisEndYear: 2050,    // End year for financial analysis (26-year period)
  upgradeYear: 2025,        // Default year when upgrade completes
  loanStartYear: 2025,      // Default year when loan starts (same as upgrade year)
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
  loanStartYear: number;
  savingsStartYear: number;
}

// Default Financial Configuration
export const defaultFinancialConfig: FinancialAnalysisConfig = {
  loanTermYears: LOAN_CONSTANTS.defaultLoanTermYears,
  annualInterestRate: LOAN_CONSTANTS.defaultAnnualInterestRate,
  capRate: LOAN_CONSTANTS.defaultCapRate,
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
  if (yearsElapsed === 0) return principal; // Return full principal at loan origination
  
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
 * @returns Array of loan balance data with year information
 */
export function generateLoanBalanceArray(
  principal: number,
  config: FinancialAnalysisConfig
): LoanBalanceData[] {
  const years = generateAnalysisYears(config);
  const startYear = config.loanStartYear; // Loan starts when loan originates
  
  return years.map(year => {
    const yearsElapsed = year - startYear;
    let balance = 0;
    
    if (yearsElapsed >= 0) {
      balance = calculateRemainingBalance(
        principal,
        config.annualInterestRate,
        config.loanTermYears,
        yearsElapsed
      );
    }
    
    return {
      year,
      balance
    };
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

// Type for loan balance data with year
export interface LoanBalanceData {
  year: number;
  balance: number;
}

// Type for cumulative savings data with year
export interface CumulativeSavingsData {
  year: number;
  cumulativeSavings: number;
  annualSavings: number;
}