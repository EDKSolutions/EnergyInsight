import React from 'react';

interface CapRateCardProps {
  currentCapRate: number;
  onCapRateChange: (value: number | null) => void;
  isUsingDefault: boolean;
}

export const CapRateCard: React.FC<CapRateCardProps> = ({
  currentCapRate,
  onCapRateChange,
  isUsingDefault,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-500">
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
            <path d="M12 3v6"/>
          </svg>
        </div>
        <div>
          <div className="text-2xl font-bold">
            {(currentCapRate * 100).toFixed(1)}%
          </div>
          <p className="text-sm text-muted-foreground">capitalization rate</p>
          {isUsingDefault && (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit bg-green-500/10 text-green-500 border-green-500/20">
              Default
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <label htmlFor="cap-rate-override" className="text-sm font-medium">
            Cap Rate Override
          </label>
          <div className="flex gap-2">
            <input
              id="cap-rate-override"
              type="number"
              step="0.1"
              min="0"
              max="20"
              placeholder={(currentCapRate * 100).toFixed(1)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800"
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                onCapRateChange(isNaN(value) ? null : value / 100);
              }}
            />
            <button
              onClick={() => onCapRateChange(null)}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Default: 4.0% (typical for NYC commercial real estate)
          </p>
        </div>

        {/* Cap Rate Explanation */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium mb-2">How Cap Rate Affects Property Value</h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p><strong>Formula:</strong> Property Value = Annual NOI ÷ Cap Rate</p>
            <p>A <strong>lower</strong> cap rate means <strong>higher</strong> property values (inverse relationship).</p>
            <p>Cap rates reflect market risk and expected returns for similar properties.</p>
          </div>
        </div>
      </div>
    </div>
  );
};