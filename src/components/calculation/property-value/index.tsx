"use client";

import React, { useState } from 'react';
import { CalculationResult } from '@/types/calculation-result-type';
import { PropertyValueChart } from './PropertyValueChart';
import { CapRateCard } from './CapRateCard';
import { LOAN_CONSTANTS } from '@/lib/calculations/constants/financial-constants';
import EditAssumptionsToggle from '@/components/shared/EditAssumptionsToggle';

interface PropertyValueData {
  year: number;
  value: number;
}

interface PropertyValueProps {
  c: CalculationResult;
}

const PropertyValue: React.FC<PropertyValueProps> = ({ c }) => {
  // State for cap rate override
  const [capRateOverride, setCapRateOverride] = useState<number | null>(null);

  // Get effective cap rate value (override or database value)
  const effectiveCapRate = capRateOverride ?? parseFloat(c.capRate?.toString() || LOAN_CONSTANTS.defaultCapRate.toString());

  // Get property value data from database
  const propertyValueNoUpgradeData: PropertyValueData[] = (c.propertyValueByYearNoUpgrade as PropertyValueData[]) || [];
  const propertyValueWithUpgradeData: PropertyValueData[] = (c.propertyValueByYearWithUpgrade as PropertyValueData[]) || [];

  // Get dynamic construction/upgrade year
  const currentYear = new Date().getFullYear();
  const constructionYear = Math.max(2025, currentYear + 1); // Default 2025 or next year

  // Define event lines for LL97 compliance milestones
  const events = [
    {
      year: constructionYear,
      label: 'Construction/Upgrade Completion',
      color: '#3b82f6' // blue
    },
    {
      year: 2030,
      label: 'LL97 Period 2030-2034',
      color: '#000000' // black
    },
    {
      year: 2035,
      label: 'LL97 Period 2035-2039',
      color: '#000000' // black
    },
    {
      year: 2040,
      label: 'LL97 Period 2040-2049',
      color: '#000000' // black
    }
  ];

  // Debug logging
  console.log('Property Value tab data:', {
    effectiveCapRate,
    propertyValueNoUpgradeData: propertyValueNoUpgradeData.length,
    propertyValueWithUpgradeData: propertyValueWithUpgradeData.length,
    hasOverride: capRateOverride !== null
  });

  return (
    <div className="space-y-6">
      <EditAssumptionsToggle c={c} />
      {/* Cap Rate Parameter Card */}
      <CapRateCard
        currentCapRate={effectiveCapRate}
        onCapRateChange={setCapRateOverride}
        isUsingDefault={capRateOverride === null}
      />

      {/* Property Value Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Property Value Over Time</h3>
        {propertyValueNoUpgradeData.length > 0 && propertyValueWithUpgradeData.length > 0 ? (
          <PropertyValueChart
            withoutUpgrade={propertyValueNoUpgradeData}
            withUpgrade={propertyValueWithUpgradeData}
            events={events}
            valueType="property-value"
          />
        ) : (
          <div className="space-y-3">
            <p className="text-gray-500">No property value data available for this calculation.</p>
            <div className="text-sm text-gray-400">
              <p>Debug info:</p>
              <ul className="list-disc ml-4">
                <li>Property value without upgrade data: {propertyValueNoUpgradeData.length} records</li>
                <li>Property value with upgrade data: {propertyValueWithUpgradeData.length} records</li>
                <li>Cap rate: {(effectiveCapRate * 100).toFixed(1)}%</li>
                <li>Has cap rate override: {capRateOverride !== null ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyValue;