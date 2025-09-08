/**
 * Financial analysis constants matching LaTeX document Section 8
 * These values are used for payback period and loan calculations
 */

// Section 8 - Financial Analysis Constants
export const defaultLoanTermYears = 15; // Typical commercial loan term
export const defaultAnnualInterestRate = 0.06; // 6% annual interest rate
export const defaultMonthlyInterestRate = defaultAnnualInterestRate / 12; // Monthly rate
export const defaultTotalPayments = defaultLoanTermYears * 12; // 180 payments

// Property valuation constants
export const defaultCapRate = 0.04; // 4% cap rate for NYC multifamily properties
export const alternativeCapRates = [0.035, 0.04, 0.045, 0.05]; // Range of cap rates for sensitivity

// Discount rates for NPV calculations (if needed for advanced analysis)
export const discountRate = 0.05; // 5% discount rate
export const inflationRate = 0.025; // 2.5% annual inflation

// Analysis periods
export const analysisStartYear = 2024;
export const analysisEndYear = 2050;
export const maxAnalysisYears = analysisEndYear - analysisStartYear;

// Loan amortization helper functions
/**
 * Calculate monthly payment for a loan
 * Formula: P × [r(1+r)^n] / [(1+r)^n-1]
 * where P=principal, r=monthly rate, n=total payments
 */
export function calculateMonthlyPayment(
  principal: number,
  monthlyRate: number = defaultMonthlyInterestRate,
  totalPayments: number = defaultTotalPayments
): number {
  if (monthlyRate === 0) {
    return principal / totalPayments;
  }
  
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
  return Math.round(monthlyPayment * 100) / 100;
}

/**
 * Calculate remaining loan balance at any point in time
 * Formula: P × [(1+r)^n-(1+r)^(m×t)] / [(1+r)^n-1]
 * where t=years elapsed, m=12 months/year
 */
export function calculateRemainingBalance(
  principal: number,
  yearsElapsed: number,
  monthlyRate: number = defaultMonthlyInterestRate,
  totalPayments: number = defaultTotalPayments
): number {
  if (monthlyRate === 0) {
    const paymentsRemaining = totalPayments - (yearsElapsed * 12);
    return Math.max(0, (paymentsRemaining / totalPayments) * principal);
  }
  
  const monthsElapsed = yearsElapsed * 12;
  
  if (monthsElapsed >= totalPayments) {
    return 0;
  }
  
  const remainingBalance = principal * 
    (Math.pow(1 + monthlyRate, totalPayments) - Math.pow(1 + monthlyRate, monthsElapsed)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
  return Math.max(0, Math.round(remainingBalance * 100) / 100);
}

/**
 * Generate loan balance array over time for visualization
 */
export function generateLoanBalanceArray(
  principal: number,
  loanTermYears: number = defaultLoanTermYears,
  monthlyRate: number = defaultMonthlyInterestRate
): number[] {
  const balances: number[] = [];
  
  for (let year = 0; year <= loanTermYears; year++) {
    const balance = calculateRemainingBalance(principal, year, monthlyRate, loanTermYears * 12);
    balances.push(balance);
  }
  
  return balances;
}

/**
 * Calculate simple payback period from cumulative savings array
 * Returns the year when cumulative savings first exceed the initial cost
 */
export function calculateSimplePaybackPeriod(
  initialCost: number,
  cumulativeSavingsArray: number[]
): number {
  for (let i = 0; i < cumulativeSavingsArray.length; i++) {
    if (cumulativeSavingsArray[i] >= initialCost) {
      return i + analysisStartYear; // Return actual year
    }
  }
  
  return -1; // Payback not achieved within analysis period
}

/**
 * Generate year array for analysis period
 */
export function generateAnalysisYears(
  startYear: number = analysisStartYear,
  endYear: number = analysisEndYear
): number[] {
  const years: number[] = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  return years;
}

/**
 * Property value calculation helper
 */
export function calculatePropertyValue(noi: number, capRate: number = defaultCapRate): number {
  if (capRate <= 0) {
    throw new Error('Cap rate must be greater than 0');
  }
  
  return Math.round((noi / capRate) * 100) / 100;
}

/**
 * Calculate net property value gain
 */
export function calculateNetPropertyValueGain(
  noiWithUpgrade: number,
  noiWithoutUpgrade: number,
  capRate: number = defaultCapRate
): number {
  const valueWithUpgrade = calculatePropertyValue(noiWithUpgrade, capRate);
  const valueWithoutUpgrade = calculatePropertyValue(noiWithoutUpgrade, capRate);
  
  return Math.round((valueWithUpgrade - valueWithoutUpgrade) * 100) / 100;
}

/**
 * Financial analysis configuration interface
 */
export interface FinancialAnalysisConfig {
  loanTermYears: number;
  annualInterestRate: number;
  capRate: number;
  analysisStartYear: number;
  analysisEndYear: number;
}

/**
 * Default financial analysis configuration
 */
export const defaultFinancialConfig: FinancialAnalysisConfig = {
  loanTermYears: defaultLoanTermYears,
  annualInterestRate: defaultAnnualInterestRate,
  capRate: defaultCapRate,
  analysisStartYear,
  analysisEndYear
};