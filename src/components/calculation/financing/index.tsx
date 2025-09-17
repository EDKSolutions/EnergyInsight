"use client";

import React, { useState } from 'react';
import { CalculationResult } from '@/types/calculation-result-type';
import { LoanChart } from './LoanChart';
import { FinancingParameterCards } from './FinancingParameterCards';
import {
  LOAN_CONSTANTS,
  CumulativeSavingsData,
  LoanBalanceData,
  generateLoanBalanceArray,
  FinancialAnalysisConfig,
  defaultFinancialConfig
} from '@/lib/calculations/constants/financial-constants';
import EditAssumptionsToggle from '@/components/shared/EditAssumptionsToggle';

interface FinancingProps {
  c: CalculationResult;
}

const Financing: React.FC<FinancingProps> = ({ c }) => {
  // State for parameter overrides
  const [interestRateOverride, setInterestRateOverride] = useState<number | null>(null);
  const [loanTermOverride, setLoanTermOverride] = useState<number | null>(null);

  // Get effective values (override or defaults)
  const effectiveInterestRate = interestRateOverride ?? LOAN_CONSTANTS.defaultAnnualInterestRate;
  const effectiveLoanTerm = loanTermOverride ?? LOAN_CONSTANTS.defaultLoanTermYears;

  // Get baseline data from database
  const dbCumulativeSavingsData: CumulativeSavingsData[] =
    (c.cumulativeSavingsByYear as CumulativeSavingsData[]) || [];
  const dbLoanBalanceData: LoanBalanceData[] =
    (c.loanBalanceByYear as LoanBalanceData[]) || [];

  // Check if we have parameter overrides
  const hasOverrides = interestRateOverride !== null || loanTermOverride !== null;

  // Debug logging
  console.log('Financing tab data:', {
    dbCumulativeSavingsData: dbCumulativeSavingsData.length,
    dbLoanBalanceData: dbLoanBalanceData.length,
    hasOverrides: { interestRate: interestRateOverride !== null, loanTerm: loanTermOverride !== null },
    effectiveInterestRate,
    effectiveLoanTerm
  });

  let cumulativeSavingsData: CumulativeSavingsData[] = [];
  let loanBalanceData: LoanBalanceData[] = [];

  if (hasOverrides) {
    // When parameters are overridden, we need to recalculate both arrays
    // For now, we'll use the database cumulative savings as baseline
    // In a full implementation, you'd want to recalculate the entire financial analysis
    // with the new loan parameters

    const initialLoanAmount = parseFloat(c.totalRetrofitCost?.toString() || '0');

    if (initialLoanAmount > 0 && dbCumulativeSavingsData.length > 0) {
      const loanConfig: FinancialAnalysisConfig = {
        ...defaultFinancialConfig,
        loanTermYears: effectiveLoanTerm,
        annualInterestRate: effectiveInterestRate,
        capRate: LOAN_CONSTANTS.defaultCapRate,
      };

      // Recalculate loan balance with new parameters
      loanBalanceData = generateLoanBalanceArray(initialLoanAmount, loanConfig);

      // For cumulative savings, use the database data for now
      // In a complete implementation, this would be recalculated based on new loan terms
      cumulativeSavingsData = dbCumulativeSavingsData;
    }
  } else {
    // Use database data when no overrides
    cumulativeSavingsData = dbCumulativeSavingsData;
    loanBalanceData = dbLoanBalanceData;
  }

  return (
    <div className="space-y-6">
      <EditAssumptionsToggle c={c} />
      {/* Parameter Override Cards */}
      <FinancingParameterCards
        currentInterestRate={effectiveInterestRate}
        currentLoanTerm={effectiveLoanTerm}
        onInterestRateChange={setInterestRateOverride}
        onLoanTermChange={setLoanTermOverride}
        isUsingDefaults={{
          interestRate: interestRateOverride === null,
          loanTerm: loanTermOverride === null,
        }}
      />

      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Cumulative Savings vs Loan Balance</h3>
        {cumulativeSavingsData.length > 0 && loanBalanceData.length > 0 ? (
          <LoanChart
            savingsData={cumulativeSavingsData}
            loanBalanceData={loanBalanceData}
            events={[]}
          />
        ) : (
          <div className="space-y-3">
            <p className="text-gray-500">No financial data available for this calculation.</p>
            <div className="text-sm text-gray-400">
              <p>Debug info:</p>
              <ul className="list-disc ml-4">
                <li>Cumulative savings data: {cumulativeSavingsData.length} records</li>
                <li>Loan balance data: {loanBalanceData.length} records</li>
                <li>Initial loan amount: ${parseFloat(c.totalRetrofitCost?.toString() || '0').toLocaleString()}</li>
                <li>Has parameter overrides: {hasOverrides ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Financing;