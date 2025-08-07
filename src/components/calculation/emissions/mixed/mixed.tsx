import React from 'react'

const Mixed = () => {
  return (
    <div className="flex flex-col">
      <p className="text-xl font-bold text-gray-900 dark:text-white">Mixed-Use Allocation</p>
      <p className="text-sm text-gray-500">
        Emissions breakdown by use type
      </p>
      <div className='overflow-x-auto mt-4'>
      <table className='w-full caption-bottom text-sm'>
        <thead className='[&_tr]:border-b'>
          <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
            <th className='h-12 px-4 align-middle font-medium text-muted-foreground text-right'>Use Type</th>
            <th className='h-12 px-4 align-middle font-medium text-muted-foreground text-right'>Area (sq ft)</th>
            <th className='h-12 px-4 align-middle font-medium text-muted-foreground text-right'>EUI</th>
            <th className='h-12 px-4 align-middle font-medium text-muted-foreground text-right'>Emissions Factor</th>
            <th className='h-12 px-4 align-middle font-medium text-muted-foreground text-right'>Emissions Limit</th>
            <th className='h-12 px-4 align-middle font-medium text-muted-foreground text-right'>Projected</th>
            <th className='h-12 px-4 align-middle font-medium text-muted-foreground text-right'>Status</th>
          </tr>
        </thead>
        <tbody className='[&_tr:last-child]:border-0'>
          <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium'>Residential</td>
            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>42,000</td>
            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>45 kBtu/ft²</td>
            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>0.00020</td>
            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>0.00696</td>
            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-green-400'>0.00001</td>
            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-green-400'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-400 rounded-full' />
                <p className='text-sm text-green-400'>Compliant</p>
              </div>
            </td>
          </tr>
          <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium'>Retail</td>
            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>3,000</td>
            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>65 kBtu/ft²</td>
            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>0.00017</td>
            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>0.01433</td>
            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-green-400'>0.00001</td>
            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0 text-green-400'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-400 rounded-full' />
                <p className='text-sm text-green-400'>Compliant</p>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
        <div className='flex justify-between mt-4'>
          <div className='flex items-center gap-2'>
            <p className='text-sm text-gray-500'>Total Building Area:</p>
          </div>
          <div className='flex items-center gap-2'>
            <p className='text-sm text-gray-500'>45,000 sq ft</p>
          </div>
        </div>
        <div className='flex justify-between mt-4'>
          <div className='flex items-center gap-2'>
            <p className='text-sm text-gray-500'>Non-Residential Percentage:</p>
          </div>
          <div className='flex items-center gap-2'>
            <p className='text-sm text-gray-500'>67.7%</p>
          </div>
        </div>
        <div className='inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-red-500 text-white hover:bg-red-500/80 text-xs'>
          <p className='text-xs text-white'>{'>5%'} espacio no-R2 - Se aplican regulaciones de uso mixto</p>
        </div>
      </div>
      
    </div>
  )
}

export default Mixed
