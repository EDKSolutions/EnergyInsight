import React from 'react'
import Property from '@/components/calculation/buildingOverview/property'
import { CalculationResult } from '@/types/calculation-result-type'
import Unit from '@/components/calculation/buildingOverview/unit'
import Data from '@/components/calculation/buildingOverview/data'
import Cards from '@/components/calculation/buildingOverview/cards'
import Calculate from '@/components/calculation/buildingOverview/calculate'
import { useCalculationEdit } from '@/hooks/useCalculationEdit'

const Calculation = ({ c }: { c: CalculationResult }) => {
  const { 
    isEditMode, 
    initializeEdit, 
    saveChanges, 
    cancelEdit,
    hasChanges 
  } = useCalculationEdit();

  const handleEditClick = () => {
    if (!isEditMode) {
      console.log('initializeEdit', c);
      initializeEdit(c);
    }
  };

  const handleSave = async () => {
    const success = await saveChanges();
    if (success) {
      // Here you could show a success toast
      console.log('Changes saved successfully');
    } else {
      // Here you could show an error toast
      console.error('Error saving changes');
    }
  };

  const handleCancel = () => {
    cancelEdit();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-500/20 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle h-5 w-5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <p className="text-lg font-bold">AI-Assisted Building Analysis</p>
          <div className="flex-1"></div>
          <div className="flex items-center gap-2">
            {!isEditMode ? (
              <button 
                onClick={handleEditClick}
                className="text-sm text-white bg-blue border border-blue rounded-lg p-2 flex items-center gap-2 hover:bg-blue/80 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pen h-4 w-4">
                  <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
                </svg>
                Edit Assumptions
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSave}
                  disabled={!hasChanges(c)}
                  className={`text-sm text-white border rounded-lg p-2 flex items-center gap-2 transition-colors ${
                    hasChanges(c) 
                      ? 'bg-green-600 border-green-600 hover:bg-green-700' 
                      : 'bg-gray-400 border-gray-400 cursor-not-allowed'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-4 w-4">
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                  Save
                </button>
                <button 
                  onClick={handleCancel}
                  className="text-sm text-gray-600 bg-gray-200 border border-gray-300 rounded-lg p-2 flex items-center gap-2 hover:bg-gray-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-4 w-4">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          {isEditMode 
            ? "Edit mode active. You can modify calculation fields and save changes."
            : "This analysis combines verified property records with AI-generated estimates for energy consumption, unit mix, and financial metrics. All estimates are based on similar buildings in Manhattan."
          }
        </p>
      </div>
      <Property c={c} />
      <Cards c={c} />
      <Unit c={c} />
      <Calculate 
        pluto={c.rawPlutoData}
        ll84={c.rawLL84Data}
      />
      <Data />
    </div>  
  )
}

export default Calculation; 
