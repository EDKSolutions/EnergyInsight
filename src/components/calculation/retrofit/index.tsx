import React from 'react'
import { CalculationResult } from '@/types/calculation-result-type'
import { useCalculationEdit } from '@/hooks/useCalculationEdit'
import EditableInputField from '@/components/shared/EditableInputField'
import { numberWithCommas } from '@/lib/utils'

const Retrofit = ({ c }: { c: CalculationResult }) => {
  const { getFieldValue } = useCalculationEdit();

  // Get retrofit cost values (fallback to defaults if not set)
  const pthpUnitCost = parseFloat(getFieldValue('pthpUnitCost', c.pthpUnitCost ?? '1100') as string)
  const pthpInstallationCost = parseFloat(getFieldValue('pthpInstallationCost', c.pthpInstallationCost ?? '450') as string)
  const pthpContingency = parseFloat(getFieldValue('pthpContingency', c.pthpContingency ?? '0.10') as string)

  // Calculate derived values
  const costPerUnit = pthpUnitCost + pthpInstallationCost
  const baseCost = costPerUnit * c.ptacUnits
  const contingencyAmount = baseCost * pthpContingency
  const totalRetrofitCost = baseCost + contingencyAmount

  // Calculate the database total for comparison
  const databaseTotal = parseFloat(c.totalRetrofitCost || '0')

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white text-card-foreground shadow-sm p-6">
        <div className="flex gap-2 items-center leading-none mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <h1 className="text-2xl font-bold text-left">Retrofit Cost Analysis</h1>
        </div>

        {/* Summary Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Retrofit Cost Card */}
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-6 rounded-lg border-2 border-emerald-300 dark:border-emerald-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Total Retrofit Cost</h3>
            </div>
            <div className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
              ${numberWithCommas(totalRetrofitCost.toFixed(0))}
            </div>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              For {c.ptacUnits} PTAC units
            </p>
            {Math.abs(totalRetrofitCost - databaseTotal) > 1 && (
              <div className="mt-2 text-xs text-orange-700 dark:text-orange-300">
                Recalculated: Database shows ${numberWithCommas(databaseTotal.toFixed(0))}
              </div>
            )}
          </div>

          {/* Cost Per Unit Card */}
          <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-lg border-2 border-blue-300 dark:border-blue-700">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Cost Per Unit</h3>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-2">
              ${numberWithCommas(costPerUnit.toFixed(0))}
            </div>
            <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <div>Unit: ${numberWithCommas(pthpUnitCost.toFixed(0))}</div>
              <div>Install: ${numberWithCommas(pthpInstallationCost.toFixed(0))}</div>
            </div>
          </div>

          {/* Contingency Fee Card */}
          <div className="bg-amber-100 dark:bg-amber-900/30 p-6 rounded-lg border-2 border-amber-300 dark:border-amber-700">
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">Contingency Fee</h3>
            <div className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-2">
              {(pthpContingency * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-300">
              ${numberWithCommas(contingencyAmount.toFixed(0))} total
            </div>
          </div>
        </div>

        {/* Editable Fields Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Retrofit Cost Parameters</h2>
            {(!c.pthpUnitCost || !c.pthpInstallationCost || !c.pthpContingency) && (
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                Using Defaults
              </div>
            )}
            {(c.pthpUnitCost && c.pthpInstallationCost && c.pthpContingency) && (
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit bg-green-500/10 text-green-500 border-green-500/20">
                Custom Values
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            💡 To edit these values, use the &quot;Edit Assumptions&quot; button in the Building Overview tab, then return here to modify the retrofit costs.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-300 dark:border-blue-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">PTHP Unit Cost</span>
                <div className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                  $<EditableInputField
                    field="pthpUnitCost"
                    value={pthpUnitCost.toString()}
                    className="text-sm font-semibold text-blue-800 dark:text-blue-200"
                    inputType="number"
                    placeholder="1100"
                  />
                </div>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">Cost per PTHP unit equipment</p>
            </div>

            <div className="bg-violet-100 dark:bg-violet-900/30 p-4 rounded-lg border border-violet-300 dark:border-violet-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-violet-900 dark:text-violet-100">Installation Cost</span>
                <div className="text-sm font-semibold text-violet-800 dark:text-violet-200">
                  $<EditableInputField
                    field="pthpInstallationCost"
                    value={pthpInstallationCost.toString()}
                    className="text-sm font-semibold text-violet-800 dark:text-violet-200"
                    inputType="number"
                    placeholder="450"
                  />
                </div>
              </div>
              <p className="text-xs text-violet-700 dark:text-violet-300">Labor & installation per unit</p>
            </div>

            <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-300 dark:border-amber-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Contingency Rate</span>
                <div className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  <EditableInputField
                    field="pthpContingency"
                    value={pthpContingency.toString()}
                    className="text-sm font-semibold text-amber-800 dark:text-amber-200"
                    inputType="number"
                    placeholder="0.10"
                  />%
                </div>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">Safety factor for unexpected costs</p>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Cost Calculation Breakdown</h2>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <div className="space-y-4">
              {/* Base Cost Calculation */}
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-600">
                <div className="text-sm">
                  <span className="font-medium">Base Equipment & Installation</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {c.ptacUnits} units × (${numberWithCommas(pthpUnitCost.toFixed(0))} + ${numberWithCommas(pthpInstallationCost.toFixed(0))})
                  </div>
                </div>
                <span className="font-semibold">${numberWithCommas(baseCost.toFixed(0))}</span>
              </div>

              {/* Contingency Calculation */}
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-600">
                <div className="text-sm">
                  <span className="font-medium">Contingency ({(pthpContingency * 100).toFixed(1)}%)</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ${numberWithCommas(baseCost.toFixed(0))} × {(pthpContingency * 100).toFixed(1)}%
                  </div>
                </div>
                <span className="font-semibold">${numberWithCommas(contingencyAmount.toFixed(0))}</span>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Total Retrofit Cost</span>
                <span className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                  ${numberWithCommas(totalRetrofitCost.toFixed(0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formula */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Calculation Formula</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            Total Cost = (Unit Cost + Installation Cost) × Number of Units × (1 + Contingency Rate)
          </div>
        </div>
      </div>
    </div>
  )
}

export default Retrofit;