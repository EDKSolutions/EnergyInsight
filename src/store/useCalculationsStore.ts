import { create } from 'zustand';
import type { Calculation } from '@/types/calculations';

interface CalculationsStore {
  calculations: Calculation[] | null;
  setCalculations: (calculations: Calculation[]) => void;
  clearCalculations: () => void;
}

export const useCalculationsStore = create<CalculationsStore>((set) => ({
  calculations: null,
  setCalculations: (calculations) => set({ calculations }),
  clearCalculations: () => set({ calculations: null }),
})); 
