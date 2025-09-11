/**
 * Property Value Analysis Constants
 * Values from LaTeX Section 10 - Property Value Analysis
 */

export const PROPERTY_VALUE_CONSTANTS = {
  // Default cap rate for property valuation
  capRate: 5.5, // 5.5% typical cap rate for NYC multifamily
  
  // Green building premium
  greenPremiumPercentage: 3.0, // 3% premium for green/sustainable buildings
  
  // Energy efficiency premium
  energyEfficiencyPremium: 2.0, // 2% additional premium for energy efficiency improvements
  
  // Market appreciation rate
  marketAppreciationRate: 3.0, // 3% annual market appreciation rate for NYC real estate
  
  // Standard loan-to-value ratio for refinancing calculations
  standardLTV: 0.75, // 75% LTV ratio
  
  // Debt service rate assumption for creditworthiness calculations
  debtServiceRate: 0.08, // 8% annual debt service rate
  
  // Maximum creditworthiness improvement cap
  maxCreditworthinessImprovement: 0.5, // 50% max improvement
} as const;

