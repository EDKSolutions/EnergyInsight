import { CalculationResult } from '@/types/calculation-result-type'
import { numberWithCommas } from '@/lib/utils'
import React from 'react'

const Card = ({ c }: { c: CalculationResult }) => {
  return (
    <div className='bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 md:w-1/4 w-full'>
    <div className='flex items-center gap-3'>
      <div className='p-2 bg-chart-quinary/10 rounded-lg'>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-chart-quinary">
          <line x1="12" x2="12" y1="2" y2="22"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      </div>
      <div>
        <div className="text-2xl font-bold">
          {numberWithCommas(c.totalRetrofitCost)}
        </div>
        <p className="text-sm text-muted-foreground">estimated value</p>
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          AI Estimate
        </div>
      </div>            
    </div>
    <p className='text-sm font-medium mt-2'>
      Total Retrofit Cost
    </p>
  </div>
  )
}

export default Card
