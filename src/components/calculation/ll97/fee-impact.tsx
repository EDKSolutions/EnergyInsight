import React from 'react';
import { CalculationResult } from '@/types/calculation-result-type';
import { getCompliancePeriods, formatCurrency, getBECreditInfo, formatEmissions } from './utils';

interface FeeImpactProps {
  c: CalculationResult;
}

const FeeImpact: React.FC<FeeImpactProps> = ({ c }) => {
  const periods = getCompliancePeriods(c);
  const beInfo = getBECreditInfo(c);

  // Calculate total savings over all periods (assuming 5 years per period)
  const totalSavingsAllPeriods = periods.reduce((total, period) => {
    if (period.currentFee && period.adjustedFee) {
      const annualSavings = period.currentFee - period.adjustedFee;
      return total + (annualSavings * 5); // 5 years per period
    }
    return total;
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-emerald-600">
            <line x1="12" x2="12" y1="2" y2="22"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">LL97 Fee Impact Summary</h3>
          <p className="text-sm text-gray-600">Annual penalty avoidance by compliance period</p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-800 mb-1">Total Penalties Without Upgrade</div>
          <div className="text-2xl font-semibold text-red-600">
            {formatCurrency(periods.reduce((sum, p) => sum + (p.currentFee || 0) * 5, 0))}
          </div>
          <div className="text-xs text-red-600">Over 20 years (2024-2043)</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-800 mb-1">Total Fees With PTHP + BE</div>
          <div className="text-2xl font-semibold text-green-600">
            {formatCurrency(periods.reduce((sum, p) => sum + (p.adjustedFee || 0) * 5, 0))}
          </div>
          <div className="text-xs text-green-600">Over 20 years (2024-2043)</div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800 mb-1">Total Savings</div>
          <div className="text-2xl font-semibold text-blue-600">
            {formatCurrency(totalSavingsAllPeriods)}
          </div>
          <div className="text-xs text-blue-600">Over 20 years (2024-2043)</div>
        </div>
      </div>

      {/* Period-by-Period Breakdown */}
      <div className="space-y-4 mb-6">
        <h4 className="text-md font-medium text-gray-900">Annual Fee Breakdown by Period</h4>

        {periods.map((period, index) => {
          const annualSavings = (period.currentFee || 0) - (period.adjustedFee || 0);
          const fiveYearSavings = annualSavings * 5;

          return (
            <div key={index} className={`border rounded-lg p-4 ${
              period.isCurrentPeriod ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h5 className="font-semibold text-gray-900">{period.years}</h5>
                  {period.isCurrentPeriod && (
                    <span className="text-xs text-blue-600">Current Period</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(annualSavings)}/year
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(fiveYearSavings)} total
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">Without Upgrade</div>
                  <div className="font-semibold text-red-600">{formatCurrency(period.currentFee)}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">With PTHP + BE</div>
                  <div className="font-semibold text-green-600">{formatCurrency(period.adjustedFee)}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Annual Savings</div>
                  <div className="font-semibold text-blue-600">{formatCurrency(annualSavings)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BE Credit Impact */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">
          Beneficial Electrification Credit Impact
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-700 mb-2">Current Annual BE Credit</div>
            <div className="text-xl font-semibold text-green-600">
              {formatEmissions(beInfo.currentCredit)}
            </div>
            <div className="text-xs text-gray-600">
              {beInfo.isFullCreditPeriod ? 'Full credit period' : 'Reduced credit period'}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-700 mb-2">Annual Value @ $268/tCO₂e</div>
            <div className="text-xl font-semibold text-green-600">
              {formatCurrency(beInfo.currentCredit * 268)}
            </div>
            <div className="text-xs text-gray-600">
              Direct penalty reduction
            </div>
          </div>
        </div>

        {beInfo.isFullCreditPeriod && beInfo.yearsLeftForFullCredit > 0 && (
          <div className="mt-3 bg-green-100 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              <span className="text-sm font-semibold text-green-800">
                Act now: Full credits expire in {beInfo.yearsLeftForFullCredit} years
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Key Insights */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Key Financial Insights</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <strong>Immediate Relief:</strong> PTHP upgrade provides immediate penalty reduction starting in 2026
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <strong>Increasing Value:</strong> Savings grow as emissions limits become more stringent in future periods
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <strong>Time-Sensitive:</strong> BE credits reduce over time and disappear completely after 2029
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <strong>Permanent Benefit:</strong> Emissions reductions provide ongoing compliance value beyond credit periods
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeImpact;