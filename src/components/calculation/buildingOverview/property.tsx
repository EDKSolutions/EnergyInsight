import React from 'react'
import { CalculationResult } from '@/types/calculation-result-type'

const Property = ({ c }: { c: CalculationResult }) => {
  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mt-8">
      <div className="flex gap-2 items-center leading-none mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building h-5 w-5">
          <rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect>
          <path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path>
          <path d="M16 6h.01"></path><path d="M12 6h.01"></path>
          <path d="M12 10h.01"></path><path d="M12 14h.01"></path>
          <path d="M16 10h.01"></path><path d="M16 14h.01"></path>
          <path d="M8 10h.01"></path><path d="M8 14h.01"></path>
        </svg>
        <h1 className="text-2xl font-bold text-left">Property Overview</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-2 items-center justify-between">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">Address:</span>
          <div className="text-gray-900 text-sm dark:text-gray-100">{c.address}</div>
        </div>
        <div className="flex gap-2 items-center justify-between">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">Building Class:</span>
          <div className="text-gray-900 text-sm dark:text-gray-100">{c.buildingClass}</div>
        </div>
        <div className="flex gap-2 items-center justify-between">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">Year Built:</span>
          <div className="text-gray-900 text-sm dark:text-gray-100">{c.yearBuilt}</div>
        </div>
        <div className="flex gap-2 items-center justify-between">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">Stories:</span>
          <div className="text-gray-900 text-sm dark:text-gray-100">{c.stories}</div>
        </div>
        <div className="flex gap-2 items-center justify-between">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">Borough:</span>
          <div className="text-gray-900 text-sm dark:text-gray-100">{c.boro}</div>
        </div>
        <div className="flex gap-2 items-center justify-between">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">Total Square Feet:</span>
          <div className="text-gray-900 text-sm dark:text-gray-100">{c.totalSquareFeet.toLocaleString()}</div>
        </div>
        <div className="flex gap-2 items-center justify-between">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">Total Units:</span>
          <div className="text-gray-900 text-sm dark:text-gray-100">{c.totalResidentialUnits}</div>
        </div>
        <div className="flex gap-2 items-center justify-between">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">PTAC Units:</span>
          <div className="text-gray-900 text-sm dark:text-gray-100">{c.ptacUnits}</div>
        </div>
      </div>
    </div>
  )
}

export default Property;
