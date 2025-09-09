/**
 * Calculation Orchestrator
 * Manages the dependency chain for all energy calculations
 * Ensures proper sequencing and data flow between calculation services
 */

import { prismaClient } from '@/lib/prisma';
import { PlutoRecord, UnitBreakdown } from '@/lib/ai/types';
import { LocalLaw84Data } from '@/lib/services/open-data-nyc';

// Import calculation services
import { calculateAllEnergyMetrics } from '../energy-calculations';
import { getEFLHFromPluto, calculateAnnualBuildingkWhHeatingPTHP } from '../constants/eflh-constants';
import { LL97CalculationService } from '../services/ll97-calculations';
import { FinancialCalculationService } from '../services/financial-calculations';
import { NOICalculationService } from '../services/noi-calculations';
import { PropertyValueCalculationService } from '../services/property-value-calculations';

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
  // LL97 calculations (Section 7)
  ll97Results?: Record<string, unknown>;
  // Financial analysis (Section 8)
  financialResults?: Record<string, unknown>;
  // NOI analysis (Section 9)
  noiResults?: Record<string, unknown>;
  // Property value analysis (Section 10)
  propertyValueResults?: Record<string, unknown>;
}

export class CalculationOrchestrator {
  private ll97Service = new LL97CalculationService();
  private financialService = new FinancialCalculationService();
  private noiService = new NOICalculationService();
  private propertyValueService = new PropertyValueCalculationService();

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
      
      // Step 4: LL97 calculations (Section 7)
      console.log('Step 4: Calculating LL97 emissions and fees');
      const ll97Results = await this.calculateLL97Analysis(input, {
        ...energyResults,
        eflhHours,
        annualBuildingkWhHeatingPTHP
      });
      
      // Step 5: Financial analysis (Section 8) 
      console.log('Step 5: Calculating financial analysis');
      const financialResults = await this.calculateFinancialAnalysis(ll97Results, energyResults);
      
      // Step 6: NOI analysis (Section 9)
      console.log('Step 6: Calculating NOI analysis');
      const noiResults = await this.calculateNOIAnalysis(input, ll97Results, energyResults);
      
      // Step 7: Property value analysis (Section 10)
      console.log('Step 7: Calculating property value analysis');
      const propertyValueResults = await this.calculatePropertyValueAnalysis(noiResults);
      
      // Step 8: Persist all results
      console.log('Step 8: Persisting complete calculation results');
      await this.persistCompleteResults(input.calculationId, {
        ...energyResults,
        eflhHours,
        annualBuildingkWhHeatingPTHP,
        ...ll97Results,
        ...financialResults,
        ...noiResults,
        ...propertyValueResults
      });
      
      const results: CalculationResults = {
        calculationId: input.calculationId,
        energyResults,
        eflhHours,
        annualBuildingkWhHeatingPTHP,
        ll97Results,
        financialResults,
        noiResults,
        propertyValueResults
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
    results: Record<string, unknown>
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
  async getCalculationData(calculationId: string): Promise<Record<string, unknown> | null> {
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
  validateEnergyCalculations(calculationId: string, data: Record<string, unknown>): boolean {
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
   * Execute LL97 calculations
   */
  private async calculateLL97Analysis(input: CalculationInput, energyData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const ll84Data = input.ll84Data;
      if (!ll84Data || !ll84Data.total_ghg_emissions) {
        console.warn('No LL84 data available for LL97 calculations, using defaults');
        return {};
      }

      const ll97Input = {
        buildingClass: input.plutoData.bldgclass || 'R6',
        totalSquareFeet: input.plutoData.bldgarea || 10000,
        totalBuildingEmissionsLL84: parseFloat(ll84Data.total_ghg_emissions) || 0,
        annualBuildingMMBtuHeatingPTAC: energyData.annualBuildingMMBtuHeatingPTAC || 0,
        annualBuildingkWhHeatingPTHP: energyData.annualBuildingkWhHeatingPTHP || 0
      };

      return this.ll97Service.calculateLL97Analysis(ll97Input);
    } catch (error) {
      console.error('Error in LL97 calculations:', error);
      return {};
    }
  }

  /**
   * Execute Financial analysis
   */
  private async calculateFinancialAnalysis(ll97Results: Record<string, unknown>, energyData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const financialInput = {
        totalRetrofitCost: (energyData.totalRetrofitCost as number) || 0,
        annualEnergySavings: (energyData.annualEnergySavings as number) || 0,
        annualFeeExceedingBudget2024to2029: (ll97Results.annualFeeExceedingBudget2024to2029 as number) || 0,
        annualFeeExceedingBudget2030to2034: (ll97Results.annualFeeExceedingBudget2030to2034 as number) || 0,
        annualFeeExceedingBudget2035to2039: (ll97Results.annualFeeExceedingBudget2035to2039 as number) || 0,
        annualFeeExceedingBudget2040to2049: (ll97Results.annualFeeExceedingBudget2040to2049 as number) || 0,
        adjustedAnnualFeeBefore2027: (ll97Results.adjustedAnnualFeeBefore2027 as number) || 0,
        adjustedAnnualFee2027to2029: (ll97Results.adjustedAnnualFee2027to2029 as number) || 0,
        adjustedAnnualFee2030to2034: (ll97Results.adjustedAnnualFee2030to2034 as number) || 0,
        adjustedAnnualFee2035to2039: (ll97Results.adjustedAnnualFee2035to2039 as number) || 0,
        adjustedAnnualFee2040to2049: (ll97Results.adjustedAnnualFee2040to2049 as number) || 0
      };

      return this.financialService.calculateFinancialAnalysis(financialInput);
    } catch (error) {
      console.error('Error in financial calculations:', error);
      return {};
    }
  }

  /**
   * Execute NOI analysis
   */
  private async calculateNOIAnalysis(input: CalculationInput, ll97Results: Record<string, unknown>, energyData: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const noiInput = {
        bbl: input.plutoData.address || '', // Use BBL from pluto data
        unitBreakdown: input.unitBreakdown,
        annualEnergySavings: (energyData.annualEnergySavings as number) || 0,
        annualFeeExceedingBudget2024to2029: (ll97Results.annualFeeExceedingBudget2024to2029 as number) || 0,
        annualFeeExceedingBudget2030to2034: (ll97Results.annualFeeExceedingBudget2030to2034 as number) || 0,
        annualFeeExceedingBudget2035to2039: (ll97Results.annualFeeExceedingBudget2035to2039 as number) || 0,
        annualFeeExceedingBudget2040to2049: (ll97Results.annualFeeExceedingBudget2040to2049 as number) || 0,
        adjustedAnnualFeeBefore2027: (ll97Results.adjustedAnnualFeeBefore2027 as number) || 0,
        adjustedAnnualFee2027to2029: (ll97Results.adjustedAnnualFee2027to2029 as number) || 0,
        adjustedAnnualFee2030to2034: (ll97Results.adjustedAnnualFee2030to2034 as number) || 0,
        adjustedAnnualFee2035to2039: (ll97Results.adjustedAnnualFee2035to2039 as number) || 0,
        adjustedAnnualFee2040to2049: (ll97Results.adjustedAnnualFee2040to2049 as number) || 0
      };

      return await this.noiService.calculateNOIAnalysis(noiInput);
    } catch (error) {
      console.error('Error in NOI calculations:', error);
      return {};
    }
  }

  /**
   * Execute Property Value analysis
   */
  private async calculatePropertyValueAnalysis(noiResults: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const propertyValueInput = {
        noiResults
      };

      return this.propertyValueService.calculatePropertyValueAnalysis(propertyValueInput);
    } catch (error) {
      console.error('Error in property value calculations:', error);
      return {};
    }
  }

  /**
   * Persist complete calculation results to database
   */
  private async persistCompleteResults(
    calculationId: string, 
    results: Record<string, unknown>
  ): Promise<void> {
    try {
      // Filter out fields that don't exist in the Prisma schema
      const filteredResults = this.filterValidPrismaFields(results);
      
      await prismaClient.calculations.update({
        where: { id: calculationId },
        data: {
          // Only valid calculation results
          ...filteredResults,
          // Update timestamp
          updatedAt: new Date()
        }
      });
      
      console.log(`Successfully persisted complete calculation results for ${calculationId}`);
      
    } catch (error) {
      console.error(`Error persisting complete results for ${calculationId}: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Filter results to only include fields that exist in the Prisma schema
   */
  private filterValidPrismaFields(results: Record<string, unknown>): Record<string, unknown> {
    // List of valid fields from Prisma schema (excluding metadata fields)
    const validFields = [
      // Energy calculations
      'annualBuildingMMBtuCoolingPTAC',
      'annualBuildingMMBtuHeatingPTAC', 
      'annualBuildingMMBtuTotalPTAC',
      'annualBuildingMMBtuHeatingPTHP',
      'annualBuildingMMBtuCoolingPTHP',
      'annualBuildingMMBtuTotalPTHP',
      'energyReductionPercentage',
      'totalRetrofitCost',
      'annualBuildingThermsHeatingPTAC',
      'annualBuildingKwhCoolingPTAC',
      'annualBuildingKwhHeatingPTHP',
      'annualBuildingKwhCoolingPTHP', 
      'annualBuildingCostPTAC',
      'annualBuildingCostPTHP',
      'annualEnergySavings',
      
      // EFLH
      'eflhHours',
      'annualBuildingkWhHeatingPTHP',
      
      // LL97 calculations
      'emissionsBudget2024to2029',
      'emissionsBudget2030to2034',
      'emissionsBudget2035to2039', 
      'emissionsBudget2040to2049',
      'totalBuildingEmissionsLL84',
      'annualFeeExceedingBudget2024to2029',
      'annualFeeExceedingBudget2030to2034',
      'annualFeeExceedingBudget2035to2039',
      'annualFeeExceedingBudget2040to2049',
      'beCreditBefore2027',
      'beCredit2027to2029',
      'adjustedTotalBuildingEmissions2024to2029',
      'adjustedTotalBuildingEmissions2030to2034',
      'adjustedTotalBuildingEmissions2035to2039',
      'adjustedTotalBuildingEmissions2040to2049',
      'adjustedAnnualFeeBefore2027',
      'adjustedAnnualFee2027to2029',
      'adjustedAnnualFee2030to2034',
      'adjustedAnnualFee2035to2039', 
      'adjustedAnnualFee2040to2049',
      
      // Financial analysis
      'annualLL97FeeAvoidance2024to2027',
      'annualLL97FeeAvoidance2027to2029',
      'annualLL97FeeAvoidance2030to2034',
      'annualLL97FeeAvoidance2035to2039',
      'annualLL97FeeAvoidance2040to2049',
      'simplePaybackPeriod',
      'cumulativeSavingsByYear',
      
      // NOI analysis
      'currentNOI',
      'noiNoUpgrade2024to2029',
      'noiNoUpgrade2030to2034',
      'noiNoUpgrade2035to2039',
      'noiNoUpgrade2040to2049',
      'noiWithUpgrade2024to2027',
      'noiWithUpgrade2027to2029',
      'noiWithUpgrade2030to2034', 
      'noiWithUpgrade2035to2039',
      'noiWithUpgrade2040to2049',
      
      // Property value analysis
      'propertyValueNoUpgrade',
      'propertyValueWithUpgrade',
      'netPropertyValueGain',
      'capRateUsed'
    ];

    const filtered: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(results)) {
      if (validFields.includes(key)) {
        filtered[key] = value;
      } else {
        console.log(`Filtering out field not in schema: ${key}`);
      }
    }
    
    return filtered;
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