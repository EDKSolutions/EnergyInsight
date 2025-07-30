import { useCalculationEditStore } from '@/store/useCalculationEditStore';
import { CalculationResult } from '@/types/calculation-result-type';

export const useCalculationEdit = () => {
  const {
    isEditMode,
    editableFields,
    toggleEditMode,
    setEditMode,
    updateField,
    updateMultipleFields,
    resetEditableFields,
    saveChanges,
    cancelEdit,
  } = useCalculationEditStore();

  // Function to initialize editing with current data
  const initializeEdit = (calculation: CalculationResult) => {
    updateMultipleFields({
      id: calculation.id, // Add the ID to the store
      buildingName: calculation.buildingName,
      address: calculation.address,
      yearBuilt: calculation.yearBuilt,
      annualEnergy: calculation.annualEnergy,
      buildingValue: calculation.buildingValue,
      capRate: calculation.capRate,
      maintenanceCost: calculation.maintenanceCost,
      occupancyRate: calculation.occupancyRate,
      ptacUnits: calculation.ptacUnits,
      siteEUI: calculation.siteEUI,
      stories: calculation.stories,
      totalResidentialUnits: calculation.totalResidentialUnits,
      totalSquareFeet: calculation.totalSquareFeet,
      unitMixBreakDown: calculation.unitMixBreakDown,
      buildingClass: calculation.buildingClass,
      taxClass: calculation.taxClass,
      zoning: calculation.zoning,
      boro: calculation.boro,
    });
    setEditMode(true);
  };

  // Function to get current value of a field (edited or original)
  const getFieldValue = <K extends keyof CalculationResult>(
    field: K,
    originalValue: CalculationResult[K]
  ): CalculationResult[K] => {
    return (editableFields[field] as CalculationResult[K]) ?? originalValue;
  };

  // Function to check if there are pending changes
  const hasChanges = (originalCalculation: CalculationResult): boolean => {
    return Object.keys(editableFields).length > 0;
  };

  // Function to get only modified fields
  const getModifiedFields = (originalCalculation: CalculationResult): Partial<CalculationResult> => {
    const modified: Partial<CalculationResult> = {};
    
    Object.entries(editableFields).forEach(([key, value]) => {
      const fieldKey = key as keyof CalculationResult;
      if (value !== originalCalculation[fieldKey]) {
        modified[fieldKey] = value as CalculationResult[keyof CalculationResult];
      }
    });
    
    return modified;
  };

  return {
    // State
    isEditMode,
    editableFields,
    
    // Basic actions
    toggleEditMode,
    setEditMode,
    updateField,
    updateMultipleFields,
    resetEditableFields,
    saveChanges,
    cancelEdit,
    
    // Utility functions
    initializeEdit,
    getFieldValue,
    hasChanges,
    getModifiedFields,
  };
}; 
