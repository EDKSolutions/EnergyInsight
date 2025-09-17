import React, { useState } from 'react';
import { CalculationResult } from '@/types/calculation-result-type';
import PropertyUseBreakdown from './property-use-breakdown';
import EmissionsLimitsBreakdownComponent from './emissions-limits-breakdown';
import EmissionsBudgetCard from './emissions-budget-card';
import BECreditVisualization from './be-credit-visualization';
import { getCompliancePeriods } from './utils';
import EditAssumptionsToggle from '@/components/shared/EditAssumptionsToggle';

interface LL97Props {
  c: CalculationResult;
}

const LL97: React.FC<LL97Props> = ({ c }) => {
  const periods = getCompliancePeriods(c);
  const [isBECreditExpanded, setIsBECreditExpanded] = useState(false);
  const [isPropertyUseExpanded, setIsPropertyUseExpanded] = useState(false);
  const [isEmissionsLimitsExpanded, setIsEmissionsLimitsExpanded] = useState(false);
  const [isEmissionsBudgetsExpanded, setIsEmissionsBudgetsExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <EditAssumptionsToggle c={c} />
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

      {/* Property Use Breakdown - Collapsible */}
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header - Clickable to expand/collapse */}
        <div
          className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          onClick={() => setIsPropertyUseExpanded(!isPropertyUseExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-600">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9,22 9,12 15,12 15,22"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Property Use Breakdown</h3>
                <p className="text-sm text-gray-600">Building composition by property type and square footage</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                {isPropertyUseExpanded ? 'Click to collapse' : 'Click to expand'}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-gray-400 transition-transform duration-200 ${isPropertyUseExpanded ? 'rotate-180' : ''}`}
              >
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        <div className={`overflow-hidden transition-all duration-300 ${isPropertyUseExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 pb-6">
            <PropertyUseBreakdown c={c} />
          </div>
        </div>
      </div>

      {/* Emissions Limits Calculation Breakdown */}
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header - Clickable to expand/collapse */}
        <div
          className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          onClick={() => setIsEmissionsLimitsExpanded(!isEmissionsLimitsExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-indigo-600">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <path d="M9 9h6v6H9z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Emissions Limits Calculation</h3>
                <p className="text-sm text-gray-600">How your building's emissions budgets are determined</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                {isEmissionsLimitsExpanded ? 'Click to collapse' : 'Click to expand'}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-gray-400 transition-transform duration-200 ${isEmissionsLimitsExpanded ? 'rotate-180' : ''}`}
              >
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        <div className={`overflow-hidden transition-all duration-300 ${isEmissionsLimitsExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 pb-6">
            <EmissionsLimitsBreakdownComponent c={c} />
          </div>
        </div>
      </div>

      {/* Emissions Budget Cards - Collapsible */}
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header - Clickable to expand/collapse */}
        <div
          className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          onClick={() => setIsEmissionsBudgetsExpanded(!isEmissionsBudgetsExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-600">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Emissions Budgets by Compliance Period</h3>
                <p className="text-sm text-gray-600">Your building's emissions limits and compliance status</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                {isEmissionsBudgetsExpanded ? 'Click to collapse' : 'Click to expand'}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-gray-400 transition-transform duration-200 ${isEmissionsBudgetsExpanded ? 'rotate-180' : ''}`}
              >
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        <div className={`overflow-hidden transition-all duration-300 ${isEmissionsBudgetsExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {periods.map((period, index) => (
                <EmissionsBudgetCard key={index} period={period} c={c} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BE Credit Visualization - Collapsible */}
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header - Clickable to expand/collapse */}
        <div
          className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          onClick={() => setIsBECreditExpanded(!isBECreditExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-600">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Beneficial Electrification Credits</h3>
                <p className="text-sm text-gray-600">Time-limited emissions credits for heating electrification</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                {isBECreditExpanded ? 'Click to collapse' : 'Click to expand'}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-gray-400 transition-transform duration-200 ${isBECreditExpanded ? 'rotate-180' : ''}`}
              >
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        <div className={`overflow-hidden transition-all duration-300 ${isBECreditExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 pb-6">
            {/* Remove outer wrapper from BECreditVisualization since we're providing it */}
            <div className="space-y-6">
              <BECreditVisualization c={c} />
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default LL97;