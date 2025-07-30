import React from 'react'
import { CalculationResult } from '@/types/calculation-result-type'
import EditableInputField from '@/components/shared/EditableInputField'
const Unit = ({ c }: { c: CalculationResult }) => {
  let unitMix: {
    source?: string;
    studio?: number;
    one_bed?: number;
    two_bed?: number;
    three_plus?: number;
    [key: string]: unknown;
  } = {};
  try {
    unitMix = JSON.parse(c.unitMixBreakDown);
  } catch (e) {
    console.error('Error parsing unitMixBreakDown:', e);
  }

  const studio = unitMix.studio ?? 0;
  const oneBed = unitMix.one_bed ?? 0;
  const twoBed = unitMix.two_bed ?? 0;
  const threePlus = unitMix.three_plus ?? 0;
  const total = studio + oneBed + twoBed + threePlus;

  const percent = (value: number) => total > 0 ? `${((value / total) * 100).toFixed(1)}%` : '-';


  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mt-8">
      <div className="flex gap-2 items-center leading-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users h-5 w-5">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <h1 className="text-2xl font-bold text-left">Unit Mix Breakdown</h1>
      </div>
      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit bg-yellow-500/10 text-yellow-500 border-yellow-500/20 mb-6">
        <span className="text-yellow-500">AI Estimate</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="flex flex-col items-center justify-between">
          <div className="text-blue-800 text-3xl dark:text-gray-100">
            <EditableInputField 
              field="studio" 
              value={studio.toString()} 
              className="text-3xl dark:text-gray-100" 
              inputType="text" 
            />
          </div>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">Studio</span>
          <span className="text-xs text-gray-400">{percent(studio)}</span>
        </div>
        <div className="flex flex-col items-center justify-between">
          <div className="text-green-600 text-3xl dark:text-gray-100">
            <EditableInputField 
              field="oneBed" 
              value={oneBed.toString()} 
              className="text-3xl dark:text-gray-100" 
              inputType="text" 
            />
          </div>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">1 Bedroom</span>
          <span className="text-xs text-gray-400">{percent(oneBed)}</span>
        </div>
        <div className="flex flex-col items-center justify-between">
          <div className="text-yellow-400 text-3xl dark:text-gray-100">
            <EditableInputField 
              field="twoBed" 
              value={twoBed.toString()} 
              className="text-3xl dark:text-gray-100" 
              inputType="text" 
            />
          </div>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">2 Bedroom</span>
          <span className="text-xs text-gray-400">{percent(twoBed)}</span>
        </div>
        <div className="flex flex-col items-center justify-between">
          <div className="text-purple-600 text-3xl dark:text-gray-100">
            <EditableInputField 
              field="threePlus" 
              value={threePlus.toString()} 
              className="text-3xl dark:text-gray-100" 
              inputType="text" 
            />
          </div>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">3+ Bedroom</span>
          <span className="text-xs text-gray-400">{percent(threePlus)}</span>
        </div>
      </div>
    </div>
  )
}

export default Unit; 
