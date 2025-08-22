import React from 'react'
import { CalculationResult } from '@/types/calculation-result-type'
import { useCalculationEdit } from '@/hooks/useCalculationEdit'
import EditableInputField from '@/components/shared/EditableInputField'
import { toast } from 'react-hot-toast'

const Unit = ({ c }: { c: CalculationResult }) => {
  const { getFieldValue, updateField } = useCalculationEdit();
  
  let unitMix: {
    source?: string;
    studio?: number;
    one_bed?: number;
    two_bed?: number;
    three_plus?: number;
    [key: string]: unknown;
  } = {};
  
  try {
    const currentUnitMix = getFieldValue('unitMixBreakDown', c.unitMixBreakDown);
    unitMix = JSON.parse(currentUnitMix);
  } catch (e) {
    console.error('Error parsing unitMixBreakDown:', e);
  }

  const studio = unitMix.studio ?? 0;
  const oneBed = unitMix.one_bed ?? 0;
  const twoBed = unitMix.two_bed ?? 0;
  const threePlus = unitMix.three_plus ?? 0;
  const total = studio + oneBed + twoBed + threePlus;
  const totalResidentialUnits = parseInt(getFieldValue('totalResidentialUnits', c.totalResidentialUnits)) || 0;

  const percent = (value: number) => total > 0 ? `${((value / total) * 100).toFixed(1)}%` : '-';

  // Function to update unitMixBreakDown when individual fields change
  const updateUnitMix = (field: 'studio' | 'one_bed' | 'two_bed' | 'three_plus', value: string) => {
    const currentUnitMix = getFieldValue('unitMixBreakDown', c.unitMixBreakDown);
    let parsed;
    
    try {
      parsed = JSON.parse(currentUnitMix);
    } catch {
      // Preserve the original source if it exists, otherwise use default
      const originalSource = unitMix.source || "rule-based";
      parsed = { source: originalSource, reasoning: unitMix.reasoning, studio: 0, one_bed: 0, two_bed: 0, three_plus: 0 };
    }

    const newValue = parseInt(value) || 0;
    
    // Validate that the value is not negative
    if (newValue < 0) {
      toast.error('Unit count cannot be negative');
      return;
    }

    // Calculate current total excluding the field being updated
    const currentTotal = (parsed.studio || 0) + (parsed.one_bed || 0) + (parsed.two_bed || 0) + (parsed.three_plus || 0);
    const otherFieldsTotal = currentTotal - (parsed[field] || 0);
    const newTotal = otherFieldsTotal + newValue;

    // Validate that the new total doesn't exceed totalResidentialUnits
    if (newTotal > totalResidentialUnits) {
      toast.error(`Total units (${newTotal}) cannot exceed total residential units (${totalResidentialUnits})`);
      return;
    }

    // Update the specific field
    parsed[field] = newValue;
    
    // Format as JSON string and update the unitMixBreakDown field
    const formattedUnitMix = JSON.stringify(parsed);
    updateField('unitMixBreakDown', formattedUnitMix);
    
    // Show success toast
    toast.success(`${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} units updated successfully`);
  };

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
              inputType="number"
              onSave={(value) => updateUnitMix('studio', value)}
            />
          </div>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">Studio</span>
          <span className="text-xs text-gray-400">{percent(studio)}</span>
        </div>
        <div className="flex flex-col items-center justify-between">
          <div className="text-green-600 text-3xl dark:text-gray-100">
            <EditableInputField 
              field="one_bed" 
              value={oneBed.toString()} 
              className="text-3xl dark:text-gray-100" 
              inputType="number"
              onSave={(value) => updateUnitMix('one_bed', value)}
            />
          </div>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">1 Bedroom</span>
          <span className="text-xs text-gray-400">{percent(oneBed)}</span>
        </div>
        <div className="flex flex-col items-center justify-between">
          <div className="text-yellow-400 text-3xl dark:text-gray-100">
            <EditableInputField 
              field="two_bed" 
              value={twoBed.toString()} 
              className="text-3xl dark:text-gray-100" 
              inputType="number"
              onSave={(value) => updateUnitMix('two_bed', value)}
            />
          </div>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">2 Bedroom</span>
          <span className="text-xs text-gray-400">{percent(twoBed)}</span>
        </div>
        <div className="flex flex-col items-center justify-between">
          <div className="text-purple-600 text-3xl dark:text-gray-100">
            <EditableInputField 
              field="three_plus" 
              value={threePlus.toString()} 
              className="text-3xl dark:text-gray-100" 
              inputType="number"
              onSave={(value) => updateUnitMix('three_plus', value)}
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
