import { create } from 'zustand';
import type { CalculationResult } from '@/types/calculation-result-type';

interface CalculationEditStore {
  // Edit mode state
  isEditMode: boolean;
  
  // Editable calculation data
  editableFields: Partial<CalculationResult>;
  
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
    }));
  },
  
  resetEditableFields: () => {
    set({ editableFields: {} });
  },
  
  saveChanges: async () => {
    try {
      // Here you can implement the logic to save changes
      // For example, make an API call
      const { editableFields } = get();
      
      // Simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Clear editable fields after saving
      set({ editableFields: {}, isEditMode: false });
      
      return true;
    } catch (error) {
      console.error('Error saving changes:', error);
      return false;
    }
  },
  
  cancelEdit: () => {
    set({ isEditMode: false, editableFields: {} });
  },
})); 
