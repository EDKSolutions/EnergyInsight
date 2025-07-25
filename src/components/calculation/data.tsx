import React from 'react'

const Data = () => {
  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mt-8">
      <div className="flex gap-2 items-center leading-none">
        <h1 className="text-2xl font-bold text-left">Data Sources & Methodology</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className='mt-4'>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 py-2">Verified Data Sources</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <ul className="list-disc list-inside">
              <li>NYC Department of Finance Property Records</li>
              <li>NYC Department of Buildings Records</li>
              <li>NYC Planning Zoning Maps</li>
              <li>Public real estate databases</li>
            </ul>
          </div>
        </div>
        <div className='mt-4'>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 py-2">AI Estimation Methodology</h2>  
          <div className="text-sm text-gray-500 dark:text-gray-400">
            
            <ul className="list-disc list-inside">
              <li>Energy consumption based on similar residential buildings in Manhattan</li>
              <li>Unit mix estimated from building design and comparable properties</li>
              <li>Financial metrics derived from neighborhood market data</li>
              <li>PTAC system assumptions based on building age and type</li>
              <li>Occupancy rates from Manhattan residential averages</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Data; 
