import React from 'react'
import { CalculationResult } from '@/types/calculation-result-type'
import { numberWithCommas } from '@/lib/utils'
import CollapsibleSection from '@/components/shared/CollapsibleSection'

const FormulaCard = ({ title, formula, result, unit, description }: {
  title: string;
  formula: string;
  result: string | number;
  unit: string;
  description?: string;
}) => (
  <div className="bg-gray-50 p-3 rounded-lg mb-3">
    <h4 className="font-medium text-sm text-gray-700 mb-1">{title}</h4>
    <div className="font-mono text-sm bg-white p-2 rounded border mb-2">
      {formula}
    </div>
    <div className="flex justify-between items-center">
      <span className="text-lg font-semibold text-blue-600">
        {typeof result === 'number' ? numberWithCommas(result.toFixed(1)) : result} {unit}
      </span>
      {description && (
        <span className="text-xs text-gray-500">{description}</span>
      )}
    </div>
  </div>
);

const EnergyCalculationBreakdown = ({ c }: { c: CalculationResult }) => {

  // Constants used in calculations
  const priceKwhHour = Number(c.priceKwhHour) || 0.24;
  const priceThermHour = Number(c.priceThermHour) || 1.45;
  const heatingCapacityPTHP = 8; // KBtu
  const pthpCOP = 1.51;
  const eflhHours = Number(c.eflhHours) || 738;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white text-card-foreground shadow-sm p-4">
        <h2 className="text-2xl font-bold mb-4">Energy Calculation Breakdown</h2>
        <p className="text-gray-600 mb-6">
          Step-by-step breakdown of how energy consumption and costs were calculated for PTAC vs PTHP systems.
        </p>

        <div className="space-y-4">
          {/* PTAC System Calculations */}
          <CollapsibleSection title="PTAC System Calculations" defaultOpen={false}>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Per-Unit Consumption (Industry Standards)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Heating (Natural Gas)</div>
                  <div className="text-lg font-semibold text-red-700">255 therms/unit/year</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Cooling (Electricity)</div>
                  <div className="text-lg font-semibold text-red-700">1,600 kWh/unit/year</div>
                </div>
              </div>

              <h4 className="font-semibold text-gray-800 mt-6">Building-Level Calculations</h4>

              <FormulaCard
                title="Total Building Heating (Therms)"
                formula={`${c.ptacUnits} units × 255 therms/unit = ${numberWithCommas(Number(c.annualBuildingThermsHeatingPTAC).toFixed(0))} therms`}
                result={Number(c.annualBuildingThermsHeatingPTAC)}
                unit="therms/year"
              />

              <FormulaCard
                title="Total Building Cooling (kWh)"
                formula={`${c.ptacUnits} units × 1,600 kWh/unit = ${numberWithCommas(Number(c.annualBuildingkWhCoolingPTAC).toFixed(0))} kWh`}
                result={Number(c.annualBuildingkWhCoolingPTAC)}
                unit="kWh/year"
              />

              <FormulaCard
                title="Total Energy (MMBtu)"
                formula={`(${numberWithCommas(Number(c.annualBuildingThermsHeatingPTAC).toFixed(0))} × 0.1) + (${numberWithCommas(Number(c.annualBuildingkWhCoolingPTAC).toFixed(0))} × 0.003412) = ${numberWithCommas(Number(c.annualBuildingMMBtuTotalPTAC).toFixed(1))} MMBtu`}
                result={Number(c.annualBuildingMMBtuTotalPTAC)}
                unit="MMBtu/year"
                description="Converting therms and kWh to MMBtu"
              />

              <FormulaCard
                title="Annual Energy Cost"
                formula={`(${numberWithCommas(Number(c.annualBuildingThermsHeatingPTAC).toFixed(0))} × $${priceThermHour}) + (${numberWithCommas(Number(c.annualBuildingkWhCoolingPTAC).toFixed(0))} × $${priceKwhHour}) = $${numberWithCommas(Number(c.annualBuildingCostPTAC).toFixed(0))}`}
                result={`$${numberWithCommas(Number(c.annualBuildingCostPTAC).toFixed(0))}`}
                unit="per year"
              />
            </div>
          </CollapsibleSection>

          {/* PTHP System Calculations */}
          <CollapsibleSection title="PTHP System Calculations">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Building Characteristics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Year Built</div>
                  <div className="text-lg font-semibold text-blue-700">{c.yearBuilt}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Stories</div>
                  <div className="text-lg font-semibold text-blue-700">{c.stories}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">EFLH Hours</div>
                  <div className="text-lg font-semibold text-blue-700">{eflhHours}</div>
                </div>
              </div>

              <h4 className="font-semibold text-gray-800 mt-6">PTHP System Parameters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Heating Capacity</div>
                  <div className="text-lg font-semibold text-green-700">{heatingCapacityPTHP} KBtu</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Coefficient of Performance (COP)</div>
                  <div className="text-lg font-semibold text-green-700">{pthpCOP}</div>
                </div>
              </div>

              <h4 className="font-semibold text-gray-800 mt-6">Energy Calculations</h4>

              <FormulaCard
                title="PTHP Heating Energy (kWh)"
                formula={`(${heatingCapacityPTHP} KBtu ÷ 3.412) × (1 ÷ ${pthpCOP}) × ${eflhHours} hours × ${c.ptacUnits} units = ${numberWithCommas(Number(c.annualBuildingkWhHeatingPTHP).toFixed(0))} kWh`}
                result={Number(c.annualBuildingkWhHeatingPTHP)}
                unit="kWh/year"
                description="Using EFLH methodology"
              />

              <FormulaCard
                title="PTHP Cooling Energy (kWh)"
                formula={`Same as PTAC cooling = ${numberWithCommas(Number(c.annualBuildingkWhCoolingPTHP).toFixed(0))} kWh`}
                result={Number(c.annualBuildingkWhCoolingPTHP)}
                unit="kWh/year"
                description="No change in cooling efficiency"
              />

              <FormulaCard
                title="Total Energy (MMBtu)"
                formula={`(${numberWithCommas(Number(c.annualBuildingkWhHeatingPTHP).toFixed(0))} + ${numberWithCommas(Number(c.annualBuildingkWhCoolingPTHP).toFixed(0))}) × 0.003412 = ${numberWithCommas(Number(c.annualBuildingMMBtuTotalPTHP).toFixed(1))} MMBtu`}
                result={Number(c.annualBuildingMMBtuTotalPTHP)}
                unit="MMBtu/year"
                description="All-electric system"
              />

              <FormulaCard
                title="Annual Energy Cost"
                formula={`(${numberWithCommas(Number(c.annualBuildingkWhHeatingPTHP).toFixed(0))} + ${numberWithCommas(Number(c.annualBuildingkWhCoolingPTHP).toFixed(0))}) × $${priceKwhHour} = $${numberWithCommas(Number(c.annualBuildingCostPTHP).toFixed(0))}`}
                result={`$${numberWithCommas(Number(c.annualBuildingCostPTHP).toFixed(0))}`}
                unit="per year"
              />
            </div>
          </CollapsibleSection>

          {/* Savings Analysis */}
          <CollapsibleSection title="Savings Analysis">
            <div className="space-y-4">
              <FormulaCard
                title="Energy Reduction"
                formula={`(${numberWithCommas(Number(c.annualBuildingMMBtuTotalPTAC).toFixed(1))} - ${numberWithCommas(Number(c.annualBuildingMMBtuTotalPTHP).toFixed(1))}) ÷ ${numberWithCommas(Number(c.annualBuildingMMBtuTotalPTAC).toFixed(1))} × 100 = ${((Number(c.annualBuildingMMBtuTotalPTAC) - Number(c.annualBuildingMMBtuTotalPTHP)) / Number(c.annualBuildingMMBtuTotalPTAC) * 100).toFixed(1)}%`}
                result={`${((Number(c.annualBuildingMMBtuTotalPTAC) - Number(c.annualBuildingMMBtuTotalPTHP)) / Number(c.annualBuildingMMBtuTotalPTAC) * 100).toFixed(1)}%`}
                unit="reduction"
              />

              <FormulaCard
                title="Annual Cost Savings"
                formula={`$${numberWithCommas(Number(c.annualBuildingCostPTAC).toFixed(0))} - $${numberWithCommas(Number(c.annualBuildingCostPTHP).toFixed(0))} = $${numberWithCommas(Number(c.annualEnergySavings).toFixed(0))}`}
                result={`$${numberWithCommas(Number(c.annualEnergySavings).toFixed(0))}`}
                unit="per year"
              />

              <FormulaCard
                title="Total Retrofit Cost"
                formula={`${c.ptacUnits} units × ($1,100 + $450) × 1.10 = $${numberWithCommas(Number(c.totalRetrofitCost).toFixed(0))}`}
                result={`$${numberWithCommas(Number(c.totalRetrofitCost).toFixed(0))}`}
                unit="one-time cost"
                description="Including 10% contingency"
              />
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
};

export default EnergyCalculationBreakdown;