import React from 'react'

const Analysis = () => {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white'>
        LL97 Compliance Analysis
        <span className='px-4 py-1 bg-green-100 text-green-500 rounded-xl text-xs'>BE Credit Applied</span>
      </div>
      <div className='flex gap-2 text-sm text-gray-500'>
        <p>Penalty exposure with BE Credit benefits</p>
      </div>
      <div className='overflow-x-auto mt-4'>
        <table className='w-full caption-bottom text-sm'>
          <thead className='[&_tr]:border-b'>
            <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted text-center'>  
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground'>Period</th>
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground'>Emissions Cap (tCO₂e)</th>
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground'>Projected Emissions (tCO₂e)</th>
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground'>Overage (tCO₂e)</th>
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground'>Annual Penalty</th>
              <th className='h-12 px-4 align-middle font-medium text-muted-foreground'>Status</th>
            </tr>
          </thead>
          <tbody className='[&_tr:last-child]:border-0'>
            <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted text-center'>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>2024-2029</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>335</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>340.0</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-red-400'>5.0</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-red-400'>$1,340</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>
                <span className='text-xs px-4 bg-gray-100 text-gray-500 rounded-xl py-1 font-bold'>Borderline</span>
              </td>
            </tr>
            <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted text-center'>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>2030-2034</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>248</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>340.0</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-red-400'>92.0</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-red-400'>$24,656</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>
                <span className='text-xs px-4 bg-red-500 text-white rounded-xl py-1 font-bold'>Non-Compliant</span>
              </td>
            </tr>
            <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted text-center'>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>Post-2035</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>196</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>340.0</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-red-400'>144.0</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-red-400'>$38,592</td>
              <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>
                <span className='text-xs px-4 bg-red-500 text-white rounded-xl py-1 font-bold'>Non-Compliant</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className='flex flex-col gap-4 mt-4'>
        <div className='w-full border border-red-200 bg-red-50 rounded-md p-4'>
          <div className='flex flex-col gap-2'>
            <p className='text-red-500 text-sm font-bold'>⚠️ Current trajectory results in significant penalty exposure starting 2024</p>
            <p className='text-gray-500 text-xs'>Penalties calculated at $268/tCO₂e overage per LL97 regulations</p>
          </div>
        </div>
        <div className='w-full border border-blue-200 bg-blue-50 rounded-md p-4'>
          <div className='flex flex-col gap-2'>
            <p className='text-blue-500 text-sm font-bold'>💧 DHW Electrification Impact</p>
            <p className='text-blue-500 text-xs'>Penalties calculated at $268/tCO₂e overage per LL97 regulations</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analysis
