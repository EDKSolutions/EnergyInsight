import React from 'react';
import { CalculationResult } from '@/types/calculation-result-type';
import { CompliancePeriod, formatCurrency, formatEmissions } from './utils';

interface EmissionsBudgetCardProps {
  period: CompliancePeriod;
  c: CalculationResult;
}

const EmissionsBudgetCard: React.FC<EmissionsBudgetCardProps> = ({ period, c }) => {
  const currentEmissions = c.totalBuildingEmissionsLL84 ? parseFloat(c.totalBuildingEmissionsLL84.toString()) : 0;
  const budget = period.emissionsBudget || 0;
  const overage = Math.max(0, currentEmissions - budget);
  const complianceRate = budget > 0 ? (currentEmissions / budget) * 100 : 0;
  const isOverBudget = currentEmissions > budget;

  // Get the adjusted emissions for this period
  let adjustedEmissions = currentEmissions;
  const adjustedKey = `adjustedTotalBuildingEmissions${period.name.replace('-', 'to')}` as keyof CalculationResult;
  if (c[adjustedKey]) {
    adjustedEmissions = parseFloat(c[adjustedKey].toString());
  }

  const adjustedOverage = Math.max(0, adjustedEmissions - budget);
  const adjustedComplianceRate = budget > 0 ? (adjustedEmissions / budget) * 100 : 0;
  const adjustedIsOverBudget = adjustedEmissions > budget;

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
      period.isCurrentPeriod ? 'border-l-blue-500' : 'border-l-gray-300'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{period.years}</h3>
          <p className="text-sm text-gray-600">Compliance Period</p>
        </div>
        {period.isCurrentPeriod && (
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
            Current Period
          </div>
        )}
      </div>

      {/* Emissions Budget */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Emissions Budget</span>
          <span className="text-lg font-semibold text-gray-900">{formatEmissions(budget)}</span>
        </div>

        {/* Current emissions vs budget */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Current Emissions</span>
              <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                {formatEmissions(currentEmissions)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  isOverBudget ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(complianceRate, 100)}%` }}
              ></div>
              {complianceRate > 100 && (
                <div className="text-xs text-red-600 mt-1">
                  {complianceRate.toFixed(0)}% of budget ({formatEmissions(overage)} over)
                </div>
              )}
            </div>
          </div>

          {/* With upgrade */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">With PTHP Upgrade</span>
              <span className={`text-sm font-medium ${adjustedIsOverBudget ? 'text-orange-600' : 'text-green-600'}`}>
                {formatEmissions(adjustedEmissions)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  adjustedIsOverBudget ? 'bg-orange-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(adjustedComplianceRate, 100)}%` }}
              ></div>
              {adjustedComplianceRate > 100 && (
                <div className="text-xs text-orange-600 mt-1">
                  {adjustedComplianceRate.toFixed(0)}% of budget ({formatEmissions(adjustedOverage)} over)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Annual Fees */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-900">Annual LL97 Fees</h4>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-red-800">Without Upgrade</span>
            <span className="text-lg font-semibold text-red-600">
              {formatCurrency(period.currentFee)}
            </span>
          </div>
          {overage > 0 && (
            <div className="text-xs text-red-600 mt-1">
              {formatEmissions(overage)} × $268/tCO₂e = {formatCurrency(period.currentFee)}
            </div>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-800">With PTHP + BE Credits</span>
            <span className="text-lg font-semibold text-green-600">
              {formatCurrency(period.adjustedFee)}
            </span>
          </div>
          {period.currentFee && period.adjustedFee && (
            <div className="text-xs text-green-600 mt-1">
              Savings: {formatCurrency(period.currentFee - period.adjustedFee)}/year
            </div>
          )}
        </div>
      </div>

      {/* Period-specific insights */}
      <div className="mt-4 bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-600">
          {period.name === '2024-2029' && (
            <>
              <strong>Initial period:</strong> LL97 fees begin in 2026. Full BE credits available for upgrades before 2027.
            </>
          )}
          {period.name === '2030-2034' && (
            <>
              <strong>Tightening standards:</strong> Emissions limits become more stringent. No BE credits available.
            </>
          )}
          {period.name === '2035-2039' && (
            <>
              <strong>Strict compliance:</strong> Significantly lower emissions limits. Focus on deep decarbonization.
            </>
          )}
          {period.name === '2040-2049' && (
            <>
              <strong>Long-term vision:</strong> Most stringent limits support NYC&apos;s carbon neutrality goals.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default EmissionsBudgetCard;