import React from 'react'
import { CalculationResult } from '@/types/calculation-result-type'
import { numberWithCommas } from '@/lib/utils'

const Comparation = ({ c }: { c: CalculationResult }) => {
  return (
    <div className='rounded-lg border bg-white text-card-foreground shadow-sm p-4'>
      <div className="flex gap-2 items-center leading-none">
        <h1 className="text-2xl font-bold text-left">PTAC vs PTHP Comparison</h1>
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
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right'>Current PTAC</th>
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right'>Proposed PTHP</th>
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right'>Savings</th>
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right'>% Reduction</th>
            </tr>
          </thead>
          <tbody className='[&_tr:last-child]:border-0'>
            <tr className='border-b transition-colors hover:bg-gray/50 data-[state=selected]:bg-muted'>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium'>Annual Building Energy</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>{numberWithCommas(Number(c.annualBuildingMMBtuTotalPTAC).toFixed(1))} MMBtu</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>{numberWithCommas(Number(c.annualBuildingMMBtuTotalPTHP).toFixed(1))} MMBtu</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>{numberWithCommas((Number(c.annualBuildingMMBtuTotalPTAC) - Number(c.annualBuildingMMBtuTotalPTHP)).toFixed(1))} MMBtu</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>{((Number(c.annualBuildingMMBtuTotalPTAC) - Number(c.annualBuildingMMBtuTotalPTHP)) / Number(c.annualBuildingMMBtuTotalPTAC) * 100).toFixed(1)}%</td>
            </tr>
            <tr className='border-b transition-colors hover:bg-gray/50 data-[state=selected]:bg-muted'>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium'>Annual Energy Cost</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>${numberWithCommas(Number(c.annualBuildingCostPTAC).toFixed(0))}</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>${numberWithCommas(Number(c.annualBuildingCostPTHP).toFixed(0))}</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>${numberWithCommas((Number(c.annualBuildingCostPTAC) - Number(c.annualBuildingCostPTHP)).toFixed(0))}</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>{((Number(c.annualBuildingCostPTAC) - Number(c.annualBuildingCostPTHP)) / Number(c.annualBuildingCostPTAC) * 100).toFixed(1)}%</td>
            </tr>
            <tr className='border-b transition-colors hover:bg-gray/50 data-[state=selected]:bg-muted'>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium'>Annual Cooling Energy</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>{numberWithCommas(Number(c.annualBuildingkWhCoolingPTAC).toFixed(0))} kWh</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>{numberWithCommas(Number(c.annualBuildingkWhCoolingPTHP).toFixed(0))} kWh</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>-</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>0%</td>
            </tr>
            <tr className='border-b transition-colors hover:bg-gray/50 data-[state=selected]:bg-muted'>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium'>Annual Heating Energy</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>{numberWithCommas(Number(c.annualBuildingThermsHeatingPTAC).toFixed(0))} therms</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>{numberWithCommas(Number(c.annualBuildingkWhHeatingPTHP).toFixed(0))} kWh</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>Fuel Switch</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>Electric</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Comparation
