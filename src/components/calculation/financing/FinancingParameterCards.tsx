import React from 'react';

interface FinancingParameterCardsProps {
  currentInterestRate: number;
  currentLoanTerm: number;
  onInterestRateChange: (value: number | null) => void;
  onLoanTermChange: (value: number | null) => void;
  isUsingDefaults: {
    interestRate: boolean;
    loanTerm: boolean;
  };
}

export const FinancingParameterCards: React.FC<FinancingParameterCardsProps> = ({
  currentInterestRate,
  currentLoanTerm,
  onInterestRateChange,
  onLoanTermChange,
  isUsingDefaults,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Interest Rate Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {(currentInterestRate * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">annual interest rate</p>
            {isUsingDefaults.interestRate && (
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit bg-green-500/10 text-green-500 border-green-500/20">
                Default
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="interest-rate" className="text-sm font-medium">
            Interest Rate Override
          </label>
          <div className="flex gap-2">
            <input
              id="interest-rate"
              type="number"
              step="0.1"
              min="0"
              max="20"
              placeholder="6.0"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                onInterestRateChange(isNaN(value) ? null : value / 100);
              }}
            />
            <button
              onClick={() => onInterestRateChange(null)}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Default: 6.0% (based on typical commercial loan rates)
          </p>
        </div>
      </div>

      {/* Loan Term Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-500">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {currentLoanTerm} years
            </div>
            <p className="text-sm text-muted-foreground">loan term</p>
            {isUsingDefaults.loanTerm && (
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit bg-green-500/10 text-green-500 border-green-500/20">
                Default
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="loan-term" className="text-sm font-medium">
            Loan Term Override
          </label>
          <div className="flex gap-2">
            <input
              id="loan-term"
              type="number"
              step="1"
              min="1"
              max="30"
              placeholder="15"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800"
              onChange={(e) => {
                const value = parseInt(e.target.value);
                onLoanTermChange(isNaN(value) ? null : value);
              }}
            />
            <button
              onClick={() => onLoanTermChange(null)}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Default: 15 years (typical for commercial energy efficiency loans)
          </p>
        </div>
      </div>
    </div>
  );
};