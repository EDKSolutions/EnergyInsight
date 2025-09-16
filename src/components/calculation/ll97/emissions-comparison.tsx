import React from 'react';
import { CalculationResult } from '@/types/calculation-result-type';
import { formatEmissions } from './utils';

interface EmissionsComparisonProps {
  c: CalculationResult;
}

const EmissionsComparison: React.FC<EmissionsComparisonProps> = ({ c }) => {
  const currentEmissions = c.totalBuildingEmissionsLL84 ? parseFloat(c.totalBuildingEmissionsLL84.toString()) : 0;

  // Get gas heating emissions that will be eliminated
  const gasHeatingMMBtu = c.annualBuildingMMBtuHeatingPTAC ? parseFloat(c.annualBuildingMMBtuHeatingPTAC.toString()) : 0;
  const gasEmissionsFactor = 0.05311; // tCO2e/MMBtu
  const gasEmissionsReduced = gasHeatingMMBtu * gasEmissionsFactor;

  // Get electric heating emissions that will be added
  const electricHeatingkWh = c.annualBuildingkWhHeatingPTHP ? parseFloat(c.annualBuildingkWhHeatingPTHP.toString()) : 0;
  const gridEmissionsFactor2024to2029 = 0.000288962; // tCO2e/kWh
  const gridEmissionsFactor2030toFuture = 0.000145; // tCO2e/kWh
  const electricEmissions2024to2029 = electricHeatingkWh * gridEmissionsFactor2024to2029;
  const electricEmissions2030toFuture = electricHeatingkWh * gridEmissionsFactor2030toFuture;

  // Calculate adjusted emissions
  const adjustedEmissions2024to2029 = currentEmissions - gasEmissionsReduced + electricEmissions2024to2029;
  const adjustedEmissions2030toFuture = currentEmissions - gasEmissionsReduced + electricEmissions2030toFuture;

  // Calculate reductions
  const reduction2024to2029 = currentEmissions - adjustedEmissions2024to2029;
  const reduction2030toFuture = currentEmissions - adjustedEmissions2030toFuture;
  const reductionPercentage2024to2029 = currentEmissions > 0 ? (reduction2024to2029 / currentEmissions) * 100 : 0;
  const reductionPercentage2030toFuture = currentEmissions > 0 ? (reduction2030toFuture / currentEmissions) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-600">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="7.5,4.21 12,6.81 16.5,4.21"></polyline>
            <polyline points="7.5,19.79 7.5,14.6 3,12"></polyline>
            <polyline points="21,12 16.5,14.6 16.5,19.79"></polyline>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Emissions Reduction Analysis</h3>
          <p className="text-sm text-gray-600">How PTHP upgrade reduces your building&apos;s carbon footprint</p>
        </div>
      </div>

      {/* Current vs Adjusted Emissions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 2024-2029 Period */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-4">2024-2029 Period</h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Emissions</span>
              <span className="text-lg font-semibold text-red-600">{formatEmissions(currentEmissions)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">With PTHP Upgrade</span>
              <span className="text-lg font-semibold text-green-600">{formatEmissions(adjustedEmissions2024to2029)}</span>
            </div>

            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Reduction</span>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">{formatEmissions(reduction2024to2029)}</div>
                  <div className="text-xs text-gray-600">{reductionPercentage2024to2029.toFixed(1)}% decrease</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2030+ Period */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-4">2030+ Period</h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Emissions</span>
              <span className="text-lg font-semibold text-red-600">{formatEmissions(currentEmissions)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">With PTHP Upgrade</span>
              <span className="text-lg font-semibold text-green-600">{formatEmissions(adjustedEmissions2030toFuture)}</span>
            </div>

            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Reduction</span>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">{formatEmissions(reduction2030toFuture)}</div>
                  <div className="text-xs text-gray-600">{reductionPercentage2030toFuture.toFixed(1)}% decrease</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Breakdown */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold text-blue-900 mb-3">How the Reduction is Calculated</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex justify-between">
            <span>Current building emissions (LL84):</span>
            <span className="font-mono">{formatEmissions(currentEmissions)}</span>
          </div>
          <div className="flex justify-between">
            <span>Less: Gas heating emissions removed:</span>
            <span className="font-mono">-{formatEmissions(gasEmissionsReduced)}</span>
          </div>
          <div className="flex justify-between">
            <span>Plus: Electric heating emissions (2024-29):</span>
            <span className="font-mono">+{formatEmissions(electricEmissions2024to2029)}</span>
          </div>
          <div className="flex justify-between">
            <span>Plus: Electric heating emissions (2030+):</span>
            <span className="font-mono">+{formatEmissions(electricEmissions2030toFuture)}</span>
          </div>
        </div>
      </div>

      {/* Factors Used */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Emissions Factors</h5>
          <div className="space-y-1 text-xs text-gray-600">
            <div>Natural Gas: 0.05311 tCO₂e/MMBtu</div>
            <div>Grid Electric (2024-29): 0.000289 tCO₂e/kWh</div>
            <div>Grid Electric (2030+): 0.000145 tCO₂e/kWh</div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Your Building&apos;s Energy</h5>
          <div className="space-y-1 text-xs text-gray-600">
            <div>Gas Heating: {gasHeatingMMBtu.toFixed(1)} MMBtu/year</div>
            <div>Electric Heating: {electricHeatingkWh.toLocaleString()} kWh/year</div>
          </div>
        </div>
      </div>

      {/* Grid Decarbonization Note */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 mt-0.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
          <div>
            <h5 className="text-sm font-semibold text-green-900 mb-1">Grid Decarbonization Benefit</h5>
            <p className="text-sm text-green-800">
              Notice how your emissions reduction <strong>increases over time</strong> as NYC&apos;s electrical grid becomes cleaner.
              By switching to electric heating now, you&apos;ll automatically benefit from ongoing grid improvements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmissionsComparison;