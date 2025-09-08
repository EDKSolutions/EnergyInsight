/**
 * Calculation Orchestrator
 * Manages the dependency chain for all energy calculations
 * Ensures proper sequencing and data flow between calculation services
 */

import { prismaClient } from '@/lib/prisma';
import { PlutoRecord, UnitBreakdown } from '@/lib/ai/types';
import { LocalLaw84Data } from '@/lib/services/open-data-nyc';

// Import calculation services (to be created)
import { calculateAllEnergyMetrics } from '../energy-calculations';
import { getEFLHFromPluto, calculateAnnualBuildingkWhHeatingPTHP } from '../constants/eflh-constants';

// Types
export interface CalculationInput {
  calculationId: string;
  plutoData: PlutoRecord;
  ll84Data: LocalLaw84Data | null;
  unitBreakdown: UnitBreakdown;
  ptacUnits: number;
}

export interface CalculationResults {
  calculationId: string;
  // Energy calculations (Sections 2-6)
  energyResults: ReturnType<typeof calculateAllEnergyMetrics>;
  // EFLH calculations
  eflhHours: number;
  annualBuildingkWhHeatingPTHP: number;
  // LL97 calculations (Section 7) - to be implemented
  ll97Results?: any;
  // Financial analysis (Section 8) - to be implemented  
  financialResults?: any;
  // NOI analysis (Section 9) - to be implemented
  noiResults?: any;
  // Property value analysis (Section 10) - to be implemented
  propertyValueResults?: any;
}

export class CalculationOrchestrator {
  /**
   * Execute complete calculation pipeline
   * Orchestrates all calculation steps in proper dependency order
   */
  async executeFullCalculation(input: CalculationInput): Promise<CalculationResults> {
    console.log(`Starting full calculation orchestration for ${input.calculationId}`);
    
    try {
      // Step 1: Basic energy calculations (Sections 2-6) - Already implemented
      console.log('Step 1: Calculating energy metrics');
      const energyResults = calculateAllEnergyMetrics(input.ptacUnits);
      
      // Step 2: EFLH calculations for more accurate PTHP heating
      console.log('Step 2: Calculating EFLH and adjusted PTHP heating');
      const eflhHours = getEFLHFromPluto(
        input.plutoData.yearbuilt || 1980,
        input.plutoData.numfloors || 6
      );
      
      const annualBuildingkWhHeatingPTHP = calculateAnnualBuildingkWhHeatingPTHP(
        input.ptacUnits,
        eflhHours
      );
      
      // Step 3: Persist intermediate results
      console.log('Step 3: Persisting intermediate calculation results');
      await this.persistIntermediateResults(input.calculationId, {
        ...energyResults,
        eflhHours,
        annualBuildingkWhHeatingPTHP
      });
      
      // Step 4: LL97 calculations (Section 7) - To be implemented
      console.log('Step 4: LL97 calculations - To be implemented');
      
      // Step 5: Financial analysis (Section 8) - To be implemented
      console.log('Step 5: Financial analysis - To be implemented');
      
      // Step 6: NOI analysis (Section 9) - To be implemented
      console.log('Step 6: NOI analysis - To be implemented');
      
      // Step 7: Property value analysis (Section 10) - To be implemented
      console.log('Step 7: Property value analysis - To be implemented');
      
      const results: CalculationResults = {
        calculationId: input.calculationId,
        energyResults,
        eflhHours,
        annualBuildingkWhHeatingPTHP
      };
      
      console.log(`Completed calculation orchestration for ${input.calculationId}`);
      return results;
      
    } catch (error) {
      console.error(`Error in calculation orchestration: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Execute only energy calculations (Sections 2-6)
   */
  async executeEnergyCalculations(input: CalculationInput): Promise<Partial<CalculationResults>> {
    console.log(`Executing energy calculations for ${input.calculationId}`);
    
    const energyResults = calculateAllEnergyMetrics(input.ptacUnits);
    const eflhHours = getEFLHFromPluto(
      input.plutoData.yearbuilt || 1980,
      input.plutoData.numfloors || 6
    );
    const annualBuildingkWhHeatingPTHP = calculateAnnualBuildingkWhHeatingPTHP(
      input.ptacUnits,
      eflhHours
    );
    
    await this.persistIntermediateResults(input.calculationId, {
      ...energyResults,
      eflhHours,
      annualBuildingkWhHeatingPTHP
    });
    
    return {
      calculationId: input.calculationId,
      energyResults,
      eflhHours,
      annualBuildingkWhHeatingPTHP
    };
  }
  
  /**
   * Persist intermediate calculation results to database
   */
  private async persistIntermediateResults(
    calculationId: string, 
    results: Record<string, any>
  ): Promise<void> {
    try {
      await prismaClient.calculations.update({
        where: { id: calculationId },
        data: {
          // Energy results (Sections 2-6)
          annualBuildingMMBtuCoolingPTAC: results.annualBuildingMMBtuCoolingPTAC,
          annualBuildingMMBtuHeatingPTAC: results.annualBuildingMMBtuHeatingPTAC,
          annualBuildingMMBtuTotalPTAC: results.annualBuildingMMBtuTotalPTAC,
          annualBuildingMMBtuHeatingPTHP: results.annualBuildingMMBtuHeatingPTHP,
          annualBuildingMMBtuCoolingPTHP: results.annualBuildingMMBtuCoolingPTHP,
          annualBuildingMMBtuTotalPTHP: results.annualBuildingMMBtuTotalPTHP,
          energyReductionPercentage: results.energyReductionPercentage,
          totalRetrofitCost: results.totalRetrofitCost,
          annualBuildingThermsHeatingPTAC: results.annualBuildingThermsHeatingPTAC,
          annualBuildingKwhCoolingPTAC: results.annualBuildingKwhCoolingPTAC,
          annualBuildingKwhHeatingPTHP: results.annualBuildingKwhHeatingPTHP,
          annualBuildingKwhCoolingPTHP: results.annualBuildingKwhCoolingPTHP,
          annualBuildingCostPTAC: results.annualBuildingCostPTAC,
          annualBuildingCostPTHP: results.annualBuildingCostPTHP,
          annualEnergySavings: results.annualEnergySavings,
          
          // EFLH results
          eflhHours: results.eflhHours,
          annualBuildingkWhHeatingPTHP: results.annualBuildingkWhHeatingPTHP,
          
          // Update timestamp
          updatedAt: new Date()
        }
      });
      
      console.log(`Successfully persisted calculation results for ${calculationId}`);
      
    } catch (error) {
      console.error(`Error persisting results for ${calculationId}: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Retrieve calculation data for dependent calculations
   */
  async getCalculationData(calculationId: string): Promise<any> {
    try {
      const calculation = await prismaClient.calculations.findUnique({
        where: { id: calculationId }
      });
      
      if (!calculation) {
        throw new Error(`Calculation ${calculationId} not found`);
      }
      
      return calculation;
      
    } catch (error) {
      console.error(`Error retrieving calculation ${calculationId}: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Validate calculation dependencies
   * Ensures required fields are present before proceeding with dependent calculations
   */
  validateEnergyCalculations(calculationId: string, data: any): boolean {
    const requiredFields = [
      'annualBuildingMMBtuTotalPTAC',
      'annualBuildingMMBtuTotalPTHP', 
      'totalRetrofitCost',
      'annualEnergySavings',
      'eflhHours'
    ];
    
    const missing = requiredFields.filter(field => data[field] == null);
    
    if (missing.length > 0) {
      console.warn(`Calculation ${calculationId} missing required fields: ${missing.join(', ')}`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Helper method to create calculation input from existing data
   */
  static createCalculationInput(
    calculationId: string,
    plutoData: PlutoRecord,
    ll84Data: LocalLaw84Data | null,
    unitBreakdown: UnitBreakdown,
    ptacUnits: number
  ): CalculationInput {
    return {
      calculationId,
      plutoData,
      ll84Data,
      unitBreakdown,
      ptacUnits
    };
  }
}

// Export singleton instance
export const calculationOrchestrator = new CalculationOrchestrator();