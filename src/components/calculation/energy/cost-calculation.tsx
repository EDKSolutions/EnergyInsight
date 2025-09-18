import React from 'react'
import { CalculationResult } from '@/types/calculation-result-type'
import { useCalculationEdit } from '@/hooks/useCalculationEdit'
import EditableInputField from '@/components/shared/EditableInputField'
import { numberWithCommas } from '@/lib/utils'
import CollapsibleSection from '@/components/shared/CollapsibleSection'

const CostCalculation = ({ c }: { c: CalculationResult }) => {
  const { getFieldValue } = useCalculationEdit();

  // Get pricing values (fallback to NYC defaults if not set)
  const priceKwhHour = parseFloat(getFieldValue('priceKwhHour', c.priceKwhHour ?? '0.24') as string)
  const priceThermHour = parseFloat(getFieldValue('priceThermHour', c.priceThermHour ?? '1.45') as string)

  // Get energy consumption values for calculation display
  const annualBuildingkWhCoolingPTAC = parseFloat(c.annualBuildingkWhCoolingPTAC || '0')
  const annualBuildingThermsHeatingPTAC = parseFloat(c.annualBuildingThermsHeatingPTAC || '0')
  const annualBuildingkWhHeatingPTHP = parseFloat(c.annualBuildingkWhHeatingPTHP || '0')
  const annualBuildingkWhCoolingPTHP = parseFloat(c.annualBuildingkWhCoolingPTHP || '0')

  // Calculate costs based on current pricing
  const ptacElectricCost = annualBuildingkWhCoolingPTAC * priceKwhHour
  const ptacGasCost = annualBuildingThermsHeatingPTAC * priceThermHour
  const totalPtacCost = ptacElectricCost + ptacGasCost

  const pthpTotalCost = (annualBuildingkWhHeatingPTHP + annualBuildingkWhCoolingPTHP) * priceKwhHour

  const annualSavings = totalPtacCost - pthpTotalCost

  return (
    <CollapsibleSection
      title="Cost Calculations Breakdown"
      defaultOpen={false}
      className="w-full mx-auto shadow-lg mt-8"
    >
      <div className="space-y-6">

        {/* Energy Pricing Section */}
        <CollapsibleSection title="Energy Pricing" defaultOpen={true}>
          <div className="flex items-center justify-between mb-4">
            {(!c.priceKwhHour || !c.priceThermHour) && (
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                Using Defaults
              </div>
            )}
            {(c.priceKwhHour && c.priceThermHour) && (
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit bg-green-500/10 text-green-500 border-green-500/20">
                From Calculation
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Electricity Price</span>
                <div className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                  $<EditableInputField
                    field="priceKwhHour"
                    value={priceKwhHour.toString()}
                    className="text-sm font-semibold text-blue-700 dark:text-blue-200"
                    inputType="number"
                    placeholder="0.24"
                  />
                  <span className="ml-1">per kWh</span>
                </div>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">Used for all electric consumption (heating & cooling)</p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Natural Gas Price</span>
                <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-200">
                  $<EditableInputField
                    field="priceThermHour"
                    value={priceThermHour.toString()}
                    className="text-sm font-semibold text-yellow-700 dark:text-yellow-200"
                    inputType="number"
                    placeholder="1.45"
                  />
                  <span className="ml-1">per therm</span>
                </div>
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Used for PTAC heating only</p>
            </div>
          </div>
        </CollapsibleSection>

        {/* PTAC Cost */}
        <CollapsibleSection title="Current PTAC System Annual Cost" defaultOpen={true}>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Cooling (Electric): {numberWithCommas(annualBuildingkWhCoolingPTAC)} kWh × ${priceKwhHour}</span>
                <span className="font-medium">${numberWithCommas(ptacElectricCost.toFixed(2))}</span>
              </div>
              <div className="flex justify-between">
                <span>Heating (Gas): {numberWithCommas(annualBuildingThermsHeatingPTAC)} therms × ${priceThermHour}</span>
                <span className="font-medium">${numberWithCommas(ptacGasCost.toFixed(2))}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-base">
                <span>Total PTAC Cost</span>
                <span>${numberWithCommas(totalPtacCost.toFixed(2))}</span>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* PTHP Cost */}
        <CollapsibleSection title="Proposed PTHP System Annual Cost" defaultOpen={true}>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Electric ({numberWithCommas(annualBuildingkWhHeatingPTHP + annualBuildingkWhCoolingPTHP)} kWh) × ${priceKwhHour}</span>
                <span className="font-medium">${numberWithCommas(pthpTotalCost.toFixed(2))}</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 ml-4">
                • Heating: {numberWithCommas(annualBuildingkWhHeatingPTHP)} kWh<br />
                • Cooling: {numberWithCommas(annualBuildingkWhCoolingPTHP)} kWh
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-base">
                <span>Total PTHP Cost</span>
                <span>${numberWithCommas(pthpTotalCost.toFixed(2))}</span>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Savings */}
        <CollapsibleSection title="Annual Energy Cost Savings" defaultOpen={true}>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-blue-800 dark:text-blue-200">Annual Energy Cost Savings</span>
              <span className="text-xl font-bold text-blue-800 dark:text-blue-200">
                ${numberWithCommas(annualSavings.toFixed(2))}
              </span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              {((annualSavings / totalPtacCost) * 100).toFixed(1)}% reduction in annual energy costs
            </p>
          </div>
        </CollapsibleSection>

        {/* Formulas */}
        <CollapsibleSection title="Calculation Formulas" defaultOpen={false}>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <div><strong>PTAC Cost:</strong> (kWh Cooling × $/kWh) + (therms Heating × $/therm)</div>
              <div><strong>PTHP Cost:</strong> (kWh Heating + kWh Cooling) × $/kWh</div>
              <div><strong>Annual Savings:</strong> PTAC Cost - PTHP Cost</div>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </CollapsibleSection>
  )
}

export default CostCalculation