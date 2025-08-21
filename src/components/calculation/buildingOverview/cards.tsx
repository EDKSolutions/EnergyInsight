import React from 'react'
import { CalculationResult } from '@/types/calculation-result-type'
import { numberWithCommas } from '@/lib/utils'
import EditableInputField from '@/components/shared/EditableInputField'

const Cards = ({ c }: { c: CalculationResult }) => {
  return (
    <div className="w-full mx-auto mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className='bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-primary/10 rounded-lg'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building h-6 w-6 text-primary">
                <rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect>
                <path d="M9 22v-4h6v4"></path>
                <path d="M8 6h.01"></path>
                <path d="M16 6h.01"></path>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{numberWithCommas(c.totalSquareFeet)}</p>
              <p className="text-sm text-muted-foreground">sq ft</p>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs mt-1">Verified</div>
            </div>
            
          </div>
          <p className='text-sm font-medium mt-2'>
            Total Floor Area
          </p>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-primary/10 rounded-lg'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="b h-6 w-6 text-success">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{numberWithCommas(c.totalResidentialUnits)}</p>
              <p className="text-sm text-muted-foreground">studios, rentals</p>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs mt-1">Verified</div>
            </div>
            
          </div>
          <p className='text-sm font-medium mt-2'>
            Total Units
          </p>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-green-500/10 rounded-lg'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-500">
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold">
                <EditableInputField 
                  field="ptacUnits" 
                  value={numberWithCommas(c.ptacUnits)} 
                  className="text-2xl font-bold" 
                  inputType="text" 
                />
              </div>
              <p className="text-sm text-muted-foreground">Avg age: 18 years</p>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit bg-yellow-500/10 text-yellow-500 border-yellow-500/20 mb-6">
                AI Estimate
              </div>
            </div>
            
          </div>
          <p className='text-sm font-medium mt-2'>
            PTAC Units
          </p>
        </div>
      </div>
    </div>
  )
}

export default Cards; 
