import React from 'react'
import { CalculationResult } from '@/types/calculation-result-type'
import { numberWithCommas } from '@/lib/utils'

const Comparation = ({ c }: { c: CalculationResult }) => {
  return (
    <div className='rounded-lg border bg-white text-card-foreground shadow-sm p-4'>
      <div className="flex gap-2 items-center leading-none">
        <h1 className="text-2xl font-bold text-left">PTAC vs PTHP: Energy Cost Executive Summary</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className='mt-2'>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p className='mb-2'>Annual energy, cost, and emissions comparison</p>
          </div>
        </div>
      </div>
      <div className="gap-4 w-full overflow-x-auto"> 
        <table className="w-full caption-bottom text-sm">
          <thead className='[&_tr]:border-b'>
            <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
              <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'>Metric</th>
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right'>
                <div className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded inline-block">
                  <span className="text-red-700 dark:text-red-300">Current PTAC</span>
                </div>
              </th>
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right'>
                <div className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded inline-block">
                  <span className="text-green-700 dark:text-green-300">Proposed PTHP</span>
                </div>
              </th>
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right'>
                <div className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded inline-block">
                  <span className="text-green-700 dark:text-green-300">Savings</span>
                </div>
              </th>
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right'>
                <div className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded inline-block">
                  <span className="text-green-700 dark:text-green-300">% Reduction</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className='[&_tr:last-child]:border-0'>
            <tr className='border-b transition-colors hover:bg-gray/50 data-[state=selected]:bg-muted'>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium'>Annual Building Energy</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>
                <div className="bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded inline-block">
                  <span className="text-red-700 dark:text-red-300">{numberWithCommas(Number(c.annualBuildingMMBtuTotalPTAC).toFixed(1))} MMBtu</span>
                </div>
              </td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>
                <div className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded inline-block">
                  <span className="text-green-700 dark:text-green-300">{numberWithCommas(Number(c.annualBuildingMMBtuTotalPTHP).toFixed(1))} MMBtu</span>
                </div>
              </td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>
                <div className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded inline-block">
                  <span className="text-green-700 dark:text-green-300">{numberWithCommas((Number(c.annualBuildingMMBtuTotalPTAC) - Number(c.annualBuildingMMBtuTotalPTHP)).toFixed(1))} MMBtu</span>
                </div>
              </td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>
                <div className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded inline-block">
                  <span className="text-green-700 dark:text-green-300">{((Number(c.annualBuildingMMBtuTotalPTAC) - Number(c.annualBuildingMMBtuTotalPTHP)) / Number(c.annualBuildingMMBtuTotalPTAC) * 100).toFixed(1)}%</span>
                </div>
              </td>
            </tr>
            <tr className='border-b transition-colors hover:bg-gray/50 data-[state=selected]:bg-muted'>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium'>Annual Heating Energy</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>
                <div className="bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded inline-block">
                  <span className="text-red-700 dark:text-red-300">{numberWithCommas(Number(c.annualBuildingThermsHeatingPTAC).toFixed(0))} therms</span>
                </div>
              </td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>
                <div className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded inline-block">
                  <span className="text-green-700 dark:text-green-300">{numberWithCommas(Number(c.annualBuildingkWhHeatingPTHP).toFixed(0))} kWh</span>
                </div>
              </td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>
                <div className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded inline-block">
                  <span className="text-green-700 dark:text-green-300">Fuel Switch</span>
                </div>
              </td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>
                <div className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded inline-block">
                  <span className="text-green-700 dark:text-green-300">Electric</span>
                </div>
              </td>
            </tr>
            <tr className='border-b transition-colors hover:bg-gray/50 data-[state=selected]:bg-muted'>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium'>Annual Energy Cost</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>
                <div className="bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded inline-block">
                  <span className="text-red-700 dark:text-red-300">${numberWithCommas(Number(c.annualBuildingCostPTAC).toFixed(0))}</span>
                </div>
              </td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>
                <div className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded inline-block">
                  <span className="text-green-700 dark:text-green-300">${numberWithCommas(Number(c.annualBuildingCostPTHP).toFixed(0))}</span>
                </div>
              </td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>
                <div className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded inline-block">
                  <span className="text-green-700 dark:text-green-300">${numberWithCommas((Number(c.annualBuildingCostPTAC) - Number(c.annualBuildingCostPTHP)).toFixed(0))}</span>
                </div>
              </td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>
                <div className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded inline-block">
                  <span className="text-green-700 dark:text-green-300">{((Number(c.annualBuildingCostPTAC) - Number(c.annualBuildingCostPTHP)) / Number(c.annualBuildingCostPTAC) * 100).toFixed(1)}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Comparation
