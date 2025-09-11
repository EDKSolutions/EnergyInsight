import React from 'react'
import { CalculationResult } from '@/types/calculation-result-type'

const Energy = ({ c }: { c: CalculationResult }) => {
  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mt-8">
      <div className="flex gap-2 items-center leading-none mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap h-5 w-5">
          <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
        </svg>
        <h1 className="text-2xl font-bold text-left">Energy Overview</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-2 items-center justify-between">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">Building Type:</span>
          <div className="text-gray-900 text-sm dark:text-gray-100">Residential Multifamily</div>
        </div>
        <div className="flex gap-2 items-center justify-between">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">PTAC Units:</span>
          <div className="text-gray-900 text-sm dark:text-gray-100">{c.ptacUnits}</div>
        </div>
        <div className="flex gap-2 items-center justify-between">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">Cap Rate:</span>
          <div className="text-gray-900 text-sm dark:text-gray-100">{(c.capRate * 100).toFixed(1)}%</div>
        </div>
        <div className="flex gap-2 items-center justify-between">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">Building Value:</span>
          <div className="text-gray-900 text-sm dark:text-gray-100">${c.buildingValue.toLocaleString()}</div>
        </div>
      </div>
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Note:</strong> Energy calculations are performed using standardized assumptions for NYC residential buildings.
        </div>
      </div>
    </div>
  )
}

export default Energy;