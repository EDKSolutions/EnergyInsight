import React from 'react';

interface NOIParameterCardProps {
  currentNOI: number;
  onNOIChange: (value: number | null) => void;
  isUsingDefault: boolean;
}

export const NOIParameterCard: React.FC<NOIParameterCardProps> = ({
  currentNOI,
  onNOIChange,
  isUsingDefault,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-500/10 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-500">
            <path d="M3 3v18h18"/>
            <path d="m19 9-5 5-4-4-3 3"/>
          </svg>
        </div>
        <div>
          <div className="text-2xl font-bold">
            ${currentNOI.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">annual net operating income</p>
          {isUsingDefault && (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit bg-green-500/10 text-green-500 border-green-500/20">
              Calculated
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <label htmlFor="noi-override" className="text-sm font-medium">
            Annual NOI Override
          </label>
          <div className="flex gap-2">
            <input
              id="noi-override"
              type="number"
              step="1000"
              min="0"
              placeholder={currentNOI.toString()}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                onNOIChange(isNaN(value) ? null : value);
              }}
            />
            <button
              onClick={() => onNOIChange(null)}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Override the calculated annual NOI to see how it affects property performance
          </p>
        </div>

        {/* NOI Calculation Placeholder */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium mb-2">How NOI is Calculated</h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full text-xs">⚠</span>
              Coming Soon
            </p>
            <p>Detailed NOI calculation methodology and breakdown will be available in a future update.</p>
          </div>
        </div>
      </div>
    </div>
  );
};