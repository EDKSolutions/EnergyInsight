"use client";

import React, { useState } from 'react';
import { CalculationResult } from '@/types/calculation-result-type';
import { NOIChart } from './NOIChart';
import { NOIParameterCard } from './NOIParameterCard';
import EditAssumptionsToggle from '@/components/shared/EditAssumptionsToggle';

interface NOIData {
  year: number;
  noi: number;
}

interface NOIProps {
  c: CalculationResult;
}

const NOI: React.FC<NOIProps> = ({ c }) => {
  // State for NOI override
  const [noiOverride, setNoiOverride] = useState<number | null>(null);

  // Get effective NOI value (override or database value)
  const effectiveAnnualNOI = noiOverride ?? parseFloat(c.annualBuildingNOI?.toString() || '0');

  // Get NOI data from database
  const noiNoUpgradeData: NOIData[] = (c.noiByYearNoUpgrade as NOIData[]) || [];
  const noiWithUpgradeData: NOIData[] = (c.noiByYearWithUpgrade as NOIData[]) || [];

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
  console.log('NOI tab data:', {
    effectiveAnnualNOI,
    noiNoUpgradeData: noiNoUpgradeData.length,
    noiWithUpgradeData: noiWithUpgradeData.length,
    hasOverride: noiOverride !== null
  });

  return (
    <div className="space-y-6">
      <EditAssumptionsToggle c={c} />
      {/* NOI Parameter Card */}
      <NOIParameterCard
        currentNOI={effectiveAnnualNOI}
        onNOIChange={setNoiOverride}
        isUsingDefault={noiOverride === null}
      />

      {/* NOI Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Net Operating Income Over Time</h3>
        {noiNoUpgradeData.length > 0 && noiWithUpgradeData.length > 0 ? (
          <NOIChart
            withoutUpgrade={noiNoUpgradeData}
            withUpgrade={noiWithUpgradeData}
            events={events}
            valueType="noi"
          />
        ) : (
          <div className="space-y-3">
            <p className="text-gray-500">No NOI data available for this calculation.</p>
            <div className="text-sm text-gray-400">
              <p>Debug info:</p>
              <ul className="list-disc ml-4">
                <li>NOI without upgrade data: {noiNoUpgradeData.length} records</li>
                <li>NOI with upgrade data: {noiWithUpgradeData.length} records</li>
                <li>Annual NOI: ${effectiveAnnualNOI.toLocaleString()}</li>
                <li>Has NOI override: {noiOverride !== null ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NOI;