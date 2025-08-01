import { create } from 'zustand';
import type { CalculationResult } from '@/types/calculation-result-type';
import { nestApiClient   } from '@/services/nest_back';
import { useCalculationResultStore } from './useCalculationResultStore';

interface CalculationEditStore {
  // Edit mode state
  isEditMode: boolean;
  
  // Editable calculation data
  editableFields: Partial<CalculationResult>;
  originalData: Partial<CalculationResult>; // Store original data for comparison
  
  // Actions
  toggleEditMode: () => void;
  setEditMode: (isEdit: boolean) => void;
  
  // Update specific fields
  updateField: <K extends keyof CalculationResult>(field: K, value: CalculationResult[K]) => void;
  updateMultipleFields: (fields: Partial<CalculationResult>) => void;
  
  // Reset editable fields
  resetEditableFields: () => void;
  
  // Save changes (simulate saving)
  saveChanges: () => Promise<boolean>;
  
  // Cancel editing
  cancelEdit: () => void;
}



export const useCalculationEditStore = create<CalculationEditStore>((set, get) => ({
  isEditMode: false,
  editableFields: {},
  originalData: {},
  
  toggleEditMode: () => {
    const { isEditMode } = get();
    set({ isEditMode: !isEditMode });
  },
  
  setEditMode: (isEdit: boolean) => {
    set({ isEditMode: isEdit });
  },
  
  updateField: (field, value) => {
    set((state) => ({
      editableFields: {
        ...state.editableFields,
        [field]: value,
      },
    }));
  },
  
  updateMultipleFields: (fields) => {
    set((state) => ({
      editableFields: {
        ...state.editableFields,
        ...fields,
      },
      originalData: fields, // Store original data for comparison
    }));
  },
  
  resetEditableFields: () => {
    set({ editableFields: {}, originalData: {} });
  },
  
  saveChanges: async () => {
    try {
      const { editableFields, originalData } = get();
      
      // Get only modified fields
      const modifiedFields: Partial<CalculationResult> = {};
      Object.entries(editableFields).forEach(([key, value]) => {
        const fieldKey = key as keyof CalculationResult;
        // Only include fields that actually changed
        if (value !== originalData[fieldKey]) {
          modifiedFields[fieldKey] = value as CalculationResult[keyof CalculationResult];
        }
      });
      
      // Always include the ID for the API call
      if (editableFields.id) {
        modifiedFields.id = editableFields.id;
      }
      
      //console.log('Modified fields only:', modifiedFields);
      
      // Send only modified fields to API
      const response = await nestApiClient.calculations.updateCalculation(
        editableFields.id as string, 
        modifiedFields as Record<string, string | number | boolean | null | undefined>
      );
      
      // Update the main store with the modified data
      const resultStore = useCalculationResultStore.getState();
      resultStore.setCalculationResult(response as CalculationResult);

      
      // Clear editable fields after saving
      set({ editableFields: {}, originalData: {}, isEditMode: false });
      
      return true;
    } catch {
      return false;
    }
  },
  
  cancelEdit: () => {
    set({ isEditMode: false, editableFields: {}, originalData: {} });
  },
})); 
