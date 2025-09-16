import React from 'react'

const Data = () => {
  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mt-8">
      <div className="flex gap-2 items-center leading-none">
        <h1 className="text-2xl font-bold text-left">Data Sources & Methodology</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className='mt-4'>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 py-2">PTAC System Calculation</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p className='mb-2'>The system uses fundamental constants for PTAC units in original units and their MMBtu equivalents.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>255 therms per year per unit for heating</li>
              <li>1,600 kWh per year per unit for cooling</li>
              <li>
                25.5 MMBtu per year per unit for heating <br />
                <span className=" text-gray-500 dark:text-gray-400 ml-5">
                  - Converted from 255 therms x 0.1 MMBtu per year unit for cooling
                </span>
              </li>
              <li>5.459427 MMBtu/kWh per year unit for cooling <br/>
                <span className=" text-gray-500 dark:text-gray-400 ml-5">
                  - Converted from 1,600 kWh x 0.003412 MMBtu/kWh = 5.459427 MMBtu
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className='mt-4'>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 py-2">Cost Calculation Methodology</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p className='mb-2'>Annual energy cost savings from switching to PTHP systems is calculated using NYC average energy prices.</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>PTAC Cost:</strong> (kWh cooling × $0.24/kWh) + (therms heating × $1.45/therm)</li>
              <li><strong>PTHP Cost:</strong> (kWh heating + kWh cooling) × $0.24/kWh</li>
              <li><strong>Annual Savings:</strong> PTAC Cost - PTHP Cost</li>
              <li className="text-blue-600 dark:text-blue-400">Energy pricing is user-adjustable for local rates</li>
            </ul>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded mt-2">
              <p className="text-xs"><strong>Note:</strong> Pricing defaults to NYC averages but can be customized in the Cost Calculations section above.</p>
            </div>
          </div>
        </div>
        <div className='mt-4'>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 py-2">Total Retrofit Cost Calculation</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p className='mb-2'>The total cost for retrofitting a PTAC to PTHP systems includes unit costs, installations costs, and contingency.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>$1,100 per PTHP unit</li>
              <li>$450 per unit installation</li>
              <li>10% contingency</li>
              <li>Formula: (Unit Cost + Install Cost) × Units × 1.10</li>
              <li>Total Number of PTHP units to be installed</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Data; 
