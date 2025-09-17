import React from 'react';
import { CalculationResult } from '@/types/calculation-result-type';
import { getBECreditInfo, formatEmissions } from './utils';

interface BECreditVisualizationProps {
  c: CalculationResult;
}

const BECreditVisualization: React.FC<BECreditVisualizationProps> = ({ c }) => {
  const beInfo = getBECreditInfo(c);
  const heatingkWh = c.annualBuildingkWhHeatingPTHP ? parseFloat(c.annualBuildingkWhHeatingPTHP.toString()) : 0;

  return (
    <div>
      {/* Header is now provided by parent component */}

      {/* Current Status */}
      <div className="mb-6">
        {beInfo.isFullCreditPeriod ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
              <span className="text-sm font-semibold text-green-800">Full BE Credits Available</span>
            </div>
            <p className="text-sm text-green-700">
              Upgrade now to receive maximum credits of {formatEmissions(beInfo.fullCredit)} annually until 2027.
            </p>
            {beInfo.yearsLeftForFullCredit > 0 && (
              <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 border-green-300">
                ⏰ {beInfo.yearsLeftForFullCredit} years left for full credits
              </div>
            )}
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                <path d="M1 21h22L12 2 1 21Z"></path>
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
              </svg>
              <span className="text-sm font-semibold text-orange-800">Reduced BE Credits Period</span>
            </div>
            <p className="text-sm text-orange-700">
              Currently in reduced credit period. Credits available: {formatEmissions(beInfo.reducedCredit)} annually until 2029.
            </p>
          </div>
        )}
      </div>

      {/* Credit Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Before 2027</h4>
          <div className="text-2xl font-semibold text-green-600 mb-1">
            {formatEmissions(beInfo.fullCredit)}
          </div>
          <div className="text-xs text-gray-600">
            0.0013 tCO₂e/kWh × {heatingkWh.toLocaleString()} kWh
          </div>
          <div className={`mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
            beInfo.isFullCreditPeriod
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}>
            {beInfo.isFullCreditPeriod ? 'Active' : 'Expired'}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">2027-2029</h4>
          <div className="text-2xl font-semibold text-orange-600 mb-1">
            {formatEmissions(beInfo.reducedCredit)}
          </div>
          <div className="text-xs text-gray-600">
            0.00065 tCO₂e/kWh × {heatingkWh.toLocaleString()} kWh
          </div>
          <div className={`mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
            !beInfo.isFullCreditPeriod
              ? 'bg-orange-50 text-orange-700 border-orange-200'
              : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}>
            {!beInfo.isFullCreditPeriod ? 'Active' : 'Future'}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">BE Credit Timeline</h4>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

          {/* Timeline items */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${
                new Date().getFullYear() < 2027 ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <div className="flex-1">
                <div className="text-sm font-medium">2024-2026: Full BE Credits</div>
                <div className="text-xs text-gray-600">Maximum credit rate of 0.0013 tCO₂e/kWh</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${
                new Date().getFullYear() >= 2027 && new Date().getFullYear() <= 2029 ? 'bg-orange-500' : 'bg-gray-300'
              }`}></div>
              <div className="flex-1">
                <div className="text-sm font-medium">2027-2029: Reduced BE Credits</div>
                <div className="text-xs text-gray-600">Reduced credit rate of 0.00065 tCO₂e/kWh</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${
                new Date().getFullYear() >= 2030 ? 'bg-red-500' : 'bg-gray-300'
              }`}></div>
              <div className="flex-1">
                <div className="text-sm font-medium">2030+: No BE Credits</div>
                <div className="text-xs text-gray-600">Credits expire, only emissions reductions count</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mt-0.5">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          <div>
            <h5 className="text-sm font-semibold text-blue-900 mb-1">Time-Sensitive Opportunity</h5>
            <p className="text-sm text-blue-800">
              {beInfo.isFullCreditPeriod
                ? `BE credits are worth ${formatEmissions(beInfo.fullCredit)} annually and will be reduced by 50% starting in 2027. Upgrade now to maximize your credits.`
                : `BE credits end completely in 2030. Current credits of ${formatEmissions(beInfo.reducedCredit)} annually are available until 2029.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BECreditVisualization;