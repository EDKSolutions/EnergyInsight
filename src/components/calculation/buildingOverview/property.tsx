import React from 'react'
import { CalculationResult } from '@/types/calculation-result-type'
import EditableField from '@/components/shared/EditableField'

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
        <EditableField
          label="Building Name"
          field="buildingName"
          value={c.buildingName}
        />
        <EditableField
          label="Building Class"
          field="buildingClass"
          value={c.buildingClass}
        />
        <EditableField
          label="Address"
          field="address"
          value={c.address}
        />
        <EditableField
          label="Tax Class"
          field="taxClass"
          value={c.taxClass}
        />
        <EditableField
          label="Year Built"
          field="yearBuilt"
          value={c.yearBuilt}
          inputType="number"
        />
        <EditableField
          label="Zoning"
          field="zoning"
          value={c.zoning}
        />
        <EditableField
          label="Stories"
          field="stories"
          value={c.stories}
          inputType="number"
        />
        <EditableField
          label="Borough"
          field="boro"
          value={c.boro}
        />
      </div>
    </div>
  )
}

export default Property;
