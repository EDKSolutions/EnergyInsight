import React, { useState } from 'react';
import { CalculationResult } from '@/types/calculation-result-type';
import { EmissionsLimitsBreakdown } from '@/lib/calculations/types/service-outputs';
import { formatEmissions } from './utils';
import { numberWithCommas } from '@/lib/utils';

interface EmissionsLimitsBreakdownProps {
  c: CalculationResult;
}

const EmissionsLimitsBreakdownComponent: React.FC<EmissionsLimitsBreakdownProps> = ({ c }) => {

  // Parse the emissions limits breakdown from the calculation result
  const breakdownData = c.emissionsLimitsBreakdown as EmissionsLimitsBreakdown | undefined;

  if (!breakdownData || !breakdownData.propertyTypes || breakdownData.propertyTypes.length === 0) {
    return null;
  }

  const periods = [
    { key: "2024-2029", label: "2024-2029" },
    { key: "2030-2034", label: "2030-2034" },
    { key: "2035-2039", label: "2035-2039" },
    { key: "2040-2049", label: "2040-2049" },
  ] as const;

  return (
    <div>
          {/* Formula Explanation */}
          <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-indigo-900 mb-2">Calculation Formula</h4>
            <div className="text-sm text-indigo-800">
              <div className="font-mono bg-white px-3 py-2 rounded border">
                emissions_limit = Σ(property_type_sqft × period_limit_per_sqft)
              </div>
              <p className="mt-2">
                Each property type has specific emissions limits (tCO₂e per square foot) that become more stringent over time.
                Your building's total limit is the sum of each property type's square footage multiplied by its respective limit.
              </p>
            </div>
          </div>

          {/* Property Type Breakdown */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900">Breakdown by Property Type</h4>

            {breakdownData.propertyTypes.map((propertyType, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium text-gray-900">{propertyType.type}</h5>
                      <p className="text-sm text-gray-600">{numberWithCommas(propertyType.squareFeet)} sq ft</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {periods.map((period) => (
                      <div key={period.key} className="bg-gray-50 p-3 rounded">
                        <div className="text-xs font-medium text-gray-600 mb-1">{period.label}</div>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {formatEmissions(propertyType.contributions[period.key])}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {numberWithCommas(propertyType.squareFeet)} × {propertyType.limits[period.key].toFixed(5)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-md font-semibold text-blue-900 mb-3">Total Emissions Budgets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {periods.map((period) => (
                <div key={period.key} className="bg-white p-3 rounded border border-blue-200">
                  <div className="text-sm font-medium text-blue-800 mb-1">{period.label}</div>
                  <div className="text-lg font-semibold text-blue-900">
                    {formatEmissions(breakdownData.totals[period.key])}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Methodology Note */}
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> Emissions limits are set by NYC Local Law 97 and vary by property type and compliance period.
              These limits become progressively more stringent to support the city's carbon neutrality goals.
            </p>
          </div>
    </div>
  );
};

export default EmissionsLimitsBreakdownComponent;