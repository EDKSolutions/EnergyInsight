import React from 'react';
import { CalculationResult } from '@/types/calculation-result-type';
import { parsePropertyUseFromDB, getTotalSquareFootage } from './utils';
import { numberWithCommas } from '@/lib/utils';

interface PropertyUseBreakdownProps {
  c: CalculationResult;
}

const PropertyUseBreakdown: React.FC<PropertyUseBreakdownProps> = ({ c }) => {
  // Only read from database field - no fallback to raw LL84 data
  const propertyUses = parsePropertyUseFromDB(c.propertyUseBreakdown);
  const totalSquareFootage = getTotalSquareFootage(propertyUses);
  const buildingTotalSqFt = parseFloat(c.totalSquareFeet.toString());

  // Check if we have property use data
  if (!propertyUses || propertyUses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-amber-600">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9,22 9,12 15,12 15,22"></polyline>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Property Use Breakdown</h3>
            <p className="text-sm text-gray-600">Building composition determines emissions budgets</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">
            <strong>No detailed property use data available.</strong> Using building class fallback for emissions calculations.
          </p>
          <div className="mt-3 bg-white p-3 rounded border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Building Class {c.buildingClass}</span>
              <span className="text-sm font-semibold">{numberWithCommas(buildingTotalSqFt)} sq ft</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-600">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9,22 9,12 15,12 15,22"></polyline>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Property Use Breakdown</h3>
          <p className="text-sm text-gray-600">From LL84 reporting data • Determines emissions budgets</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-green-50 text-green-700 border-green-200">
          ✓ Detailed property mix available
        </div>
      </div>

      <div className="space-y-3">
        {propertyUses.map((use, index) => {
          const percentage = totalSquareFootage > 0 ? (use.squareFeet / totalSquareFootage) * 100 : 0;

          return (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{use.propertyType}</h4>
                  <p className="text-sm text-gray-600">{percentage.toFixed(1)}% of total building</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-blue-600">
                    {numberWithCommas(use.squareFeet)} sq ft
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total Building Area</span>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {numberWithCommas(totalSquareFootage)} sq ft
            </div>
            {Math.abs(totalSquareFootage - buildingTotalSqFt) > 1 && (
              <div className="text-xs text-gray-500">
                PLUTO: {numberWithCommas(buildingTotalSqFt)} sq ft
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-blue-800 text-sm">
          <strong>Why this matters:</strong> Each property type has different LL97 emissions limits.
          Your building&apos;s specific mix determines your emissions budget for each compliance period.
        </p>
      </div>
    </div>
  );
};

export default PropertyUseBreakdown;