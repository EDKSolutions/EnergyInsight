import React from 'react'

const Current = () => {
  return (
    <div className="flex flex-col gap-4">
        <p className="text-xl font-bold text-gray-900 dark:text-white">Current Emissions Profile</p>
        <p className="text-sm text-gray-500">
          Annual emissions breakdown with BE Credit impact
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-gray-100 rounded-lg p-4 dark:bg-gray-700 dark:text-white'>
            <p className='text-sm text-gray-500 dark:text-white'>Total Site Emissions</p>
            <p className='text-lg text-blue-800 dark:text-blue-400 font-bold my-2'>
              385 tCO₂e/year
            </p>
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs mt-1 bg-white dark:bg-gray-700 dark:text-white">LL84 Reported</div>
          </div>  
          <div className='bg-gray-100 rounded-lg p-4 dark:bg-gray-700 dark:text-white'>
            <p className='text-sm text-gray-500 dark:text-white'>Emissions per sq ft</p>
            <p className='text-lg text-dark-900 dark:text-blue-400 font-bold my-2'>
              0.00856 tCO₂e/sq ft
            </p>
          </div>
          
          
        </div>
        <div className='border-t border-1.5 border-gray-200 dark:border-gray-700 my-2' />
        <div>
          <div className='flex items-center gap-2'>
            <p className='text-sm text-gray-500 dark:text-white'>Include DHW Electrification?</p>
          </div>
          <div className='flex items-center gap-2 mt-4'>
            <div className='w-full bg-green-100 border border-green-500 rounded mr-2 self-center md:p-8 p-4'>
              <div className='flex items-center justify-between w-full'>
                <div className='text-xs text-gray-500'>
                  🏷 BE Credit (from Electrifying Hot Water):
                </div>
                <div className='text-md font-semibold text-green-500 dark:text-green-500'>
                  45 tCO₂e/year
                </div>
              </div>
              <div className='flex items-center justify-between w-full mt-4'>
                <div className='text-xs text-gray-500'>
                  🧮 Effective LL97 Emissions (after credit):
                </div>
                <div className='text-md font-semibold text-green-500 dark:text-green-500'>
                  340.0 tCO₂e/year
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='border-t border-1.5 border-gray-200 dark:border-gray-700 my-2' />
        <div className=''>
          <p className='text-sm font-semibold text-gray-900 dark:text-white'>Fuel Source Breakdown</p>
          <div className='flex justify-between gap-2 my-5 md:px-4 px-2'>
            <div className='flex w-1/2'>
              <div className='w-4 h-4 bg-blue-700 rounded mr-2 self-center' />
              <p className='text-sm text-gray-500 dark:text-white'>Natural Gas</p>
            </div>
            <div className='flex w-1/2 justify-end'>
              <p className='text-md font-semibold text-gray-500 dark:text-white'>245 tCO₂e (64%)</p>
            </div>
          </div>
          <div className='flex justify-between gap-2 my-6 md:px-4 px-2'>
            <div className='flex w-1/2'>
              <div className='w-4 h-4 bg-green-500 rounded mr-2 self-center' />
              <p className='text-sm text-gray-500 dark:text-white'>Electricity</p>
            </div>
            <div className='flex w-1/2 justify-end'>
              <p className='text-md font-semibold text-gray-500 dark:text-white'>245 tCO₂e (64%)</p>
            </div>
          </div>
        </div>
    </div>
  )
}

export default Current
