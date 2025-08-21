import React from 'react'
import { CalculationResult } from '@/types/calculation-result-type'

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
      <div className="gap-4 w-full"> 
        <table className="w-full caption-bottom text-sm">
          <thead className='[&_tr]:border-b'>
            <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
              <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'>Metric</th>
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right'>Current PTAC</th>
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right'>PTHP</th>
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right'>Savings</th>
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right'>% Reduction</th>
            </tr>
          </thead>
          <tbody className='[&_tr:last-child]:border-0'>
            <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium'>Annual Energy Consumption</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>100,000 MMBtu</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>100,000 MMBtu</td>  
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>100,000 MMBtu</td>  
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right'>100,000 MMBtu</td>  
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Comparation
