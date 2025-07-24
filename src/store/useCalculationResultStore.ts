import { create } from 'zustand';
import type { CalculationResult } from '@/types/calculation-result-type';

interface CalculationResultStore {
  calculationResult: CalculationResult | null;
  setCalculationResult: (result: CalculationResult) => void;
  clearCalculationResult: () => void;
}

export const useCalculationResultStore = create<CalculationResultStore>((set) => ({
  calculationResult: null,
  setCalculationResult: (result) => set({ calculationResult: result }),
  clearCalculationResult: () => set({ calculationResult: null }),
})); 
