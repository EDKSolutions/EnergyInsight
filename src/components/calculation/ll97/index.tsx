import React from 'react';
import { CalculationResult } from '@/types/calculation-result-type';
import PropertyUseBreakdown from './property-use-breakdown';
import EmissionsBudgetCard from './emissions-budget-card';
import BECreditVisualization from './be-credit-visualization';
import EmissionsComparison from './emissions-comparison';
import FeeImpact from './fee-impact';
import { getCompliancePeriods } from './utils';

interface LL97Props {
  c: CalculationResult;
}

const LL97: React.FC<LL97Props> = ({ c }) => {
  const periods = getCompliancePeriods(c);

  return (
    <div className="flex flex-col gap-6">
      {/* Introduction */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Local Law 97 Compliance Analysis</h2>
            <p className="text-sm text-gray-600">Understanding your building&apos;s emissions budget and penalty avoidance opportunity</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-700">
            Local Law 97 requires NYC buildings over 25,000 sq ft to meet emissions limits starting in 2024, with penalties of <strong>$268 per ton CO₂e</strong> for exceedances.
            This analysis shows how PTHP upgrades with Beneficial Electrification credits can achieve compliance and avoid penalties.
          </p>
        </div>
      </div>

      {/* Property Use Breakdown */}
      <PropertyUseBreakdown c={c} />

      {/* Emissions Budget Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emissions Budgets by Compliance Period</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {periods.map((period, index) => (
            <EmissionsBudgetCard key={index} period={period} c={c} />
          ))}
        </div>
      </div>

      {/* BE Credit Visualization */}
      <BECreditVisualization c={c} />

      {/* Emissions Comparison */}
      <EmissionsComparison c={c} />

      {/* Fee Impact Summary */}
      <FeeImpact c={c} />

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
              <path d="M9 11l3 3 8-8"></path>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9"></path>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Why Upgrade to PTHP Now?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>Immediate Compliance:</strong> Achieve LL97 compliance starting in 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>Penalty Avoidance:</strong> Eliminate or reduce costly LL97 penalties</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>BE Credits:</strong> Time-limited credits available until 2029</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>Future-Proof:</strong> Benefit from ongoing grid decarbonization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>Energy Savings:</strong> Reduce operational costs while complying</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>Property Value:</strong> Maintain competitive market position</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LL97;