import React from 'react'
import { CalculationResult } from '@/types/calculation-result-type'
import { useCalculationEdit } from '@/hooks/useCalculationEdit'
import EditableInputField from '@/components/shared/EditableInputField'
import { toast } from 'react-hot-toast'

const Energy = ({ c }: { c: CalculationResult }) => {
  const { getFieldValue, updateField } = useCalculationEdit();
  
  const energyProfile: { electric?: number; gas?: number; [key: string]: unknown } = {};
  try {
    const currentEnergyProfile = getFieldValue('energyProfile', c.energyProfile);
    const parsed = JSON.parse(currentEnergyProfile);
    energyProfile.electric = parsed.electric ? parseFloat(parsed.electric) : 0;
    energyProfile.gas = parsed.gas ? parseFloat(parsed.gas) : 0;
  } catch (e) {
    console.error('Error parsing energyProfile:', e);
  }

  // Function to update energyProfile when electric or gas changes
  const updateEnergyProfile = (field: 'electric' | 'gas', value: string) => {
    const currentProfile = getFieldValue('energyProfile', c.energyProfile);
    let parsed;
    
    try {
      parsed = JSON.parse(currentProfile);
    } catch {
      parsed = { electric: "60%", gas: "40%" };
    }

    const newValue = parseFloat(value) || 0;
    
    // Validate that the sum equals 100
    if (field === 'electric') {
      const gasValue = parseFloat(parsed.gas?.replace('%', '') || '40');
      if (newValue + gasValue > 100) {
        toast.error('The sum of Electric and Gas must be equal to 100%');
        return;
      }
      // Auto-adjust gas to maintain 100% total
      const adjustedGas = 100 - newValue;
      parsed.electric = `${newValue}%`;
      parsed.gas = `${adjustedGas}%`;
    } else if (field === 'gas') {
      const electricValue = parseFloat(parsed.electric?.replace('%', '') || '60');
      if (newValue + electricValue > 100) {
        toast.error('The sum of Electric and Gas must be equal to 100%');
        return;
      }
      // Auto-adjust electric to maintain 100% total
      const adjustedElectric = 100 - newValue;
      parsed.electric = `${adjustedElectric}%`;
      parsed.gas = `${newValue}%`;
    }
    
    // Format as JSON string and update only the energyProfile field
    const formattedProfile = JSON.stringify(parsed);
    updateField('energyProfile', formattedProfile);
  };

  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mt-8">
      <div className="flex gap-2 items-center leading-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap h-5 w-5">
          <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
        </svg>
        <h1 className="text-2xl font-bold text-left">Energy Profile</h1>
      </div>
      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit bg-yellow-500/10 text-yellow-500 border-yellow-500/20 mb-6">
        <span className="text-yellow-500">AI Estimate</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="mb-6">
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Fuel Mix
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="block text-sm font-medium text-blue-700 dark:text-blue-300">Electricity</span>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-200">
                <EditableInputField 
                  field="electric" 
                  value={(energyProfile.electric ?? 60).toString()} 
                  className="text-xs font-semibold text-blue-700 dark:text-blue-200" 
                  inputType="number"
                  onSave={(value) => updateEnergyProfile('electric', value)}
                />
              </span>
            </div>
            <div className="w-full bg-blue-100 dark:bg-blue-900 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${energyProfile.electric ?? 60}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="block text-sm font-medium text-yellow-700 dark:text-yellow-300">Natural Gas</span>
              <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-200">
                <EditableInputField 
                  field="gas" 
                  value={(energyProfile.gas ?? 40).toString()} 
                  className="text-xs font-semibold text-yellow-700 dark:text-yellow-200" 
                  inputType="number"
                  onSave={(value) => updateEnergyProfile('gas', value)}
                />
              </span>
            </div>
            <div className="w-full bg-yellow-100 dark:bg-yellow-900 rounded-full h-2">
              <div className="bg-yellow-400 h-2 rounded-full transition-all duration-300" style={{ width: `${energyProfile.gas ?? 40}%` }}></div>
            </div>
          </div>
        </div>
        <div className='w-full px-4'>
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Key Metrics
          </div>
          <div className='grid grid-cols-1 gap-4 w-full'>
            <div className='flex items-center justify-between w-full'>
              <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Site EUI
              </div>  
              <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                <EditableInputField 
                  field="siteEUI" 
                  value={c.siteEUI} 
                  className="text-sm font-medium text-gray-700 dark:text-gray-300" 
                  inputType="number"
                  abbreviate=" kBtu/ft²/year"
                />
              </div>
            </div>
            <div className='flex items-center justify-between w-full'>
              <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Occupancy Rate
              </div>  
              <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                <EditableInputField 
                  field="occupancyRate" 
                  value={c.occupancyRate} 
                  className="text-sm font-medium text-gray-700 dark:text-gray-300" 
                  inputType="number"
                  abbreviate="%"
                />
              </div>
            </div>
            <div className='flex items-center justify-between w-full'>
              <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Maintenance Cost
              </div>  
              <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                <EditableInputField 
                  field="maintenanceCost" 
                  value={c.maintenanceCost} 
                  className="text-sm font-medium text-gray-700 dark:text-gray-300" 
                  inputType="number"
                  abbreviate=" /unit/year"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Energy; 
