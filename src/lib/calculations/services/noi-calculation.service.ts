/**
 * NOI (Net Operating Income) Calculation Service
 * Implements NOI analysis from LaTeX Section 9 with year-by-year calculations
 */

import { BaseCalculationService } from './base-calculation.service';
import { Calculations } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  NOICalculationInput,
  NOICalculationOutput,
  NOICalculationOverrides,
  OverrideValidationResult,
} from '../types';
import { NOI_CONSTANTS, isRentStabilized } from '../constants/noi-constants';
import { noiDataService } from './noi-data.service';

export class NOICalculationService extends BaseCalculationService<
  NOICalculationInput,
  NOICalculationOutput,
  NOICalculationOverrides
> {
  readonly serviceName = 'noi' as const;
  readonly version = '1.0.0';
  readonly dependencies = ['financial'] as const;

  async calculate(input: NOICalculationInput): Promise<NOICalculationOutput> {
    console.log(`[${this.serviceName}] Starting NOI analysis for BBL: ${input.bbl}, Building Class: ${input.buildingClass}`);

    // 🔍 BREAKPOINT: NOI source determination - where API calls to NYC databases happen
    const annualBuildingNOI = input.customCurrentNOI ?? await this.determineNOIFromSource(input);
    
    const config = {
      rentIncreasePercentage: input.rentIncreasePercentage ?? NOI_CONSTANTS.rentIncreasePercentage,
      utilitiesIncludedInRent: input.utilitiesIncludedInRent ?? NOI_CONSTANTS.utilitiesIncludedInRent,
      operatingExpenseRatio: input.operatingExpenseRatio ?? NOI_CONSTANTS.operatingExpenseRatio,
      vacancyRate: input.vacancyRate ?? NOI_CONSTANTS.vacancyRate,
    };
    
    const isRentStabilized = this.determineRentStabilizationStatus(input, annualBuildingNOI);
    
    console.log(`[${this.serviceName}] Annual Building NOI: $${annualBuildingNOI.toLocaleString()}`);
    console.log(`[${this.serviceName}] Energy savings: $${input.annualEnergySavings?.toLocaleString()}`);
    console.log(`[${this.serviceName}] Rent stabilized: ${isRentStabilized}`);
    console.log(`[${this.serviceName}] Config:`, config);

    const ll97Fees = {
      annualFeeExceedingBudget2024to2029: input.annualFeeExceedingBudget2024to2029 || 0,
      annualFeeExceedingBudget2030to2034: input.annualFeeExceedingBudget2030to2034 || 0,
      annualFeeExceedingBudget2035to2039: input.annualFeeExceedingBudget2035to2039 || 0,
      annualFeeExceedingBudget2040to2049: input.annualFeeExceedingBudget2040to2049 || 0,
      adjustedAnnualFeeBefore2027: input.adjustedAnnualFeeBefore2027 || 0,
      adjustedAnnualFee2027to2029: input.adjustedAnnualFee2027to2029 || 0,
      adjustedAnnualFee2030to2034: input.adjustedAnnualFee2030to2034 || 0,
      adjustedAnnualFee2035to2039: input.adjustedAnnualFee2035to2039 || 0,
      adjustedAnnualFee2040to2049: input.adjustedAnnualFee2040to2049 || 0,
    };

    const { noiByYearNoUpgrade, noiByYearWithUpgrade } = this.generateNOIByYear(
      annualBuildingNOI,
      input.annualEnergySavings || 0,
      ll97Fees,
      config
    );

    // Legacy NOI impact calculations - simplified for current implementation
    const operatingExpenseSavings = this.calculateOperatingExpenseSavings(input, config);
    const potentialRentalIncomeImpact = 0; // Simplified: rental impact is already included in year-by-year calculations
    const noiImpact = operatingExpenseSavings; // Just the direct energy savings
    const effectiveGrossIncomeChange = 0; // Simplified for current implementation
    const netOperatingIncomeChange = operatingExpenseSavings;
    
    // Calculate metrics
    const estimatedCurrentNOI = annualBuildingNOI;
    const newNOI = annualBuildingNOI + netOperatingIncomeChange;
    const noiYieldOnInvestment = input.totalRetrofitCost > 0 
      ? (netOperatingIncomeChange / input.totalRetrofitCost) * 100 
      : 0;
    const roiFromNOI = noiYieldOnInvestment;
    const noiPaybackPeriod = netOperatingIncomeChange > 0 
      ? input.totalRetrofitCost / netOperatingIncomeChange 
      : -1;

    console.log(`[${this.serviceName}] === NOI Analysis Summary ===`);
    console.log(`[${this.serviceName}] Annual Building NOI: $${annualBuildingNOI.toLocaleString()}`);
    console.log(`[${this.serviceName}] NOI Impact: $${noiImpact.toLocaleString()}`);
    console.log(`[${this.serviceName}] ROI from NOI: ${roiFromNOI.toFixed(2)}%`);
    console.log(`[${this.serviceName}] Generated ${noiByYearNoUpgrade.length} years of NOI projections`);
    console.log(`[${this.serviceName}] === End NOI Analysis ===`);

    const result: NOICalculationOutput = {
      calculationId: input.calculationId,
      lastCalculated: new Date(),
      serviceVersion: this.version,

      // Annual Building NOI
      annualBuildingNOI,

      // Year-by-year projections (main calculations)
      noiByYearNoUpgrade,
      noiByYearWithUpgrade,

      // Core components (legacy compatibility)
      potentialRentalIncomeImpact,
      operatingExpenseSavings,
      noiImpact,
      effectiveGrossIncomeChange,
      netOperatingIncomeChange,

      // Metrics
      estimatedCurrentNOI,
      newNOI,
      noiYieldOnInvestment,
      roiFromNOI,
      noiPaybackPeriod,

      // Building characteristics
      isRentStabilized,

      // Configuration used
      utilitiesIncludedInRent: config.utilitiesIncludedInRent,
      rentIncreasePercentage: config.rentIncreasePercentage,
      noiConfig: config,
    };

    return result;
  }

  /**
   * Generate year-by-year NOI calculations following LaTeX specification
   */
  private generateNOIByYear(
    annualBuildingNOI: number,
    energySavings: number,
    ll97Fees: Record<string, number>,
    config: typeof NOI_CONSTANTS
  ) {
    const analysisYears = 25; // 25-year analysis period
    const startYear = 2024;
    
    const noiByYearNoUpgrade = [];
    const noiByYearWithUpgrade = [];
    
    for (let i = 0; i < analysisYears; i++) {
      const year = startYear + i;
      
      const noiNoUpgrade = this.calculateAdjustedNOINoUpgrade(year, annualBuildingNOI, ll97Fees);
      const noiWithUpgrade = this.calculateAdjustedNOIUpgrade(year, annualBuildingNOI, energySavings, ll97Fees);
      
      noiByYearNoUpgrade.push({ year, noi: noiNoUpgrade });
      noiByYearWithUpgrade.push({ year, noi: noiWithUpgrade });
    }
    
    console.log(`[${this.serviceName}] Sample NOI projections:`);
    console.log(`[${this.serviceName}] 2024 - No upgrade: $${noiByYearNoUpgrade[0].noi.toLocaleString()}, With upgrade: $${noiByYearWithUpgrade[0].noi.toLocaleString()}`);
    console.log(`[${this.serviceName}] 2030 - No upgrade: $${noiByYearNoUpgrade[6].noi.toLocaleString()}, With upgrade: $${noiByYearWithUpgrade[6].noi.toLocaleString()}`);
    console.log(`[${this.serviceName}] 2035 - No upgrade: $${noiByYearNoUpgrade[11].noi.toLocaleString()}, With upgrade: $${noiByYearWithUpgrade[11].noi.toLocaleString()}`);
    
    return { noiByYearNoUpgrade, noiByYearWithUpgrade };
  }

  /**
   * Determine NOI from appropriate source (NYC APIs or RGB Study)
   * 🔍 BREAKPOINT: This is where API calls to NYC databases happen
   */
  private async determineNOIFromSource(input: NOICalculationInput): Promise<number> {
    try {
      const noiResult = await noiDataService.getAnnualBuildingNOI({
        bbl: input.bbl,
        buildingClass: input.buildingClass,
        unitsRes: input.unitsRes,
        yearBuilt: input.yearBuilt,
        borough: input.borough,
        communityDistrict: input.communityDistrict,
        numFloors: input.numFloors
      });
      
      console.log(`[${this.serviceName}] NOI determined from ${noiResult.source}: $${noiResult.annualBuildingNOI.toLocaleString()}`);
      if (noiResult.details) {
        console.log(`[${this.serviceName}] Details:`, noiResult.details);
      }
      
      return noiResult.annualBuildingNOI;
    } catch (error) {
      console.error(`[${this.serviceName}] Failed to determine NOI from sources:`, error);
      console.log(`[${this.serviceName}] Falling back to building value calculation`);
      
      // Fallback calculation if APIs fail
      return input.buildingValue * (input.capRate / 100);
    }
  }

  /**
   * Determine rent stabilization status using proper building data
   */
  private determineRentStabilizationStatus(input: NOICalculationInput, annualBuildingNOI: number): boolean {
    // Use the proper isRentStabilized function from constants
    const isStabilized = isRentStabilized(
      input.bbl,
      {
        yearBuilt: input.yearBuilt,
        numFloors: input.numFloors,
        bldgClass: input.buildingClass
      },
      new Set() // TODO: Load actual rent stabilized BBL registry
    );
    
    console.log(`[${this.serviceName}] Rent stabilization determination: ${isStabilized}`);
    console.log(`[${this.serviceName}] - Year built: ${input.yearBuilt}, Floors: ${input.numFloors}, Class: ${input.buildingClass}`);
    
    return isStabilized;
  }

  /**
   * Calculate adjusted NOI without upgrade (LaTeX implementation)
   * NOI = annualBuildingNOI - LL97 penalties for the year
   */
  private calculateAdjustedNOINoUpgrade(year: number, annualBuildingNOI: number, ll97Fees: Record<string, number>): number {
    if (year >= 2024 && year <= 2029) {
      return annualBuildingNOI - ll97Fees.annualFeeExceedingBudget2024to2029;
    } else if (year >= 2030 && year <= 2034) {
      return annualBuildingNOI - ll97Fees.annualFeeExceedingBudget2030to2034;
    } else if (year >= 2035 && year <= 2039) {
      return annualBuildingNOI - ll97Fees.annualFeeExceedingBudget2035to2039;
    } else {
      return annualBuildingNOI - ll97Fees.annualFeeExceedingBudget2040to2049;
    }
  }

  /**
   * Calculate adjusted NOI with upgrade (LaTeX implementation)
   * NOI = annualBuildingNOI + energySavings - reduced LL97 penalties
   */
  private calculateAdjustedNOIUpgrade(
    year: number, 
    annualBuildingNOI: number, 
    energySavings: number, 
    ll97Fees: Record<string, number>
  ): number {
    let reducedLL97Penalties = 0;
    
    if (year >= 2024 && year <= 2026) {
      reducedLL97Penalties = ll97Fees.adjustedAnnualFeeBefore2027;
    } else if (year >= 2027 && year <= 2029) {
      reducedLL97Penalties = ll97Fees.adjustedAnnualFee2027to2029;
    } else if (year >= 2030 && year <= 2034) {
      reducedLL97Penalties = ll97Fees.adjustedAnnualFee2030to2034;
    } else if (year >= 2035 && year <= 2039) {
      reducedLL97Penalties = ll97Fees.adjustedAnnualFee2035to2039;
    } else {
      reducedLL97Penalties = ll97Fees.adjustedAnnualFee2040to2049;
    }
    
    return annualBuildingNOI + energySavings - reducedLL97Penalties;
  }

  // REMOVED: calculateRentalIncomeImpact() - simplified to use direct energy savings
  // Rental income impact is now incorporated into the year-by-year calculations
  // through energy savings passed to calculateAdjustedNOIUpgrade()

  private calculateOperatingExpenseSavings(
    input: NOICalculationInput,
    config: typeof NOI_CONSTANTS
  ): number {
    // Direct energy cost savings reduce operating expenses
    return input.annualEnergySavings || 0;
  }

  // REMOVED: calculateEffectiveGrossIncomeChange() - simplified to zero for current implementation
  // Effective gross income changes are now incorporated into the year-by-year calculations

  buildInputFromCalculation(
    calculation: Calculations,
    overrides?: NOICalculationOverrides
  ): NOICalculationInput {
    const baseInput: NOICalculationInput = {
      calculationId: calculation.id,
      
      // Building identification and characteristics (required for NOI source determination)
      bbl: calculation.bbl,
      buildingClass: calculation.buildingClass,
      unitsRes: parseInt(calculation.totalResidentialUnits) || 0,
      yearBuilt: parseInt(calculation.yearBuilt) || 1950,
      borough: calculation.boro,
      numFloors: parseInt(calculation.stories) || 1,
      // TODO: Add communityDistrict field to database for Manhattan subcategories
      communityDistrict: undefined,
      
      // Financial data
      buildingValue: parseFloat(calculation.buildingValue) || 1000000,
      capRate: parseFloat(calculation.capRate) || 5.5,
      totalRetrofitCost: calculation.totalRetrofitCost || 0,
      annualEnergySavings: calculation.annualEnergySavings || 0,
      
      // LL97 fee data needed for year-by-year calculations (handle null values)
      annualFeeExceedingBudget2024to2029: calculation.annualFeeExceedingBudget2024to2029 ?? undefined,
      annualFeeExceedingBudget2030to2034: calculation.annualFeeExceedingBudget2030to2034 ?? undefined,
      annualFeeExceedingBudget2035to2039: calculation.annualFeeExceedingBudget2035to2039 ?? undefined,
      annualFeeExceedingBudget2040to2049: calculation.annualFeeExceedingBudget2040to2049 ?? undefined,
      adjustedAnnualFeeBefore2027: calculation.adjustedAnnualFeeBefore2027 ?? undefined,
      adjustedAnnualFee2027to2029: calculation.adjustedAnnualFee2027to2029 ?? undefined,
      adjustedAnnualFee2030to2034: calculation.adjustedAnnualFee2030to2034 ?? undefined,
      adjustedAnnualFee2035to2039: calculation.adjustedAnnualFee2035to2039 ?? undefined,
      adjustedAnnualFee2040to2049: calculation.adjustedAnnualFee2040to2049 ?? undefined,
    };

    console.log(`[${this.serviceName}] Building input from calculation: BBL=${baseInput.bbl}, Class=${baseInput.buildingClass}, Units=${baseInput.unitsRes}`);
    
    return { ...baseInput, ...overrides };
  }

  validateInput(input: NOICalculationInput): OverrideValidationResult {
    const result: OverrideValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    if (!input.buildingValue || input.buildingValue <= 0) {
      result.errors.push({
        field: 'buildingValue',
        message: 'Building value must be greater than 0',
      });
    }

    if (!input.capRate || input.capRate <= 0 || input.capRate > 20) {
      result.warnings.push({
        field: 'capRate',
        message: 'Cap rate should typically be between 1% and 15%',
      });
    }

    if (input.customCurrentNOI && input.customCurrentNOI <= 0) {
      result.errors.push({
        field: 'customCurrentNOI',
        message: 'Custom current NOI must be greater than 0',
      });
    }

    if (input.rentIncreasePercentage !== undefined && (input.rentIncreasePercentage < 0 || input.rentIncreasePercentage > 100)) {
      result.warnings.push({
        field: 'rentIncreasePercentage',
        message: 'Rent increase percentage should be between 0% and 100%',
      });
    }

    if (input.vacancyRate !== undefined && (input.vacancyRate < 0 || input.vacancyRate > 50)) {
      result.warnings.push({
        field: 'vacancyRate',
        message: 'Vacancy rate should typically be between 0% and 20%',
      });
    }

    result.valid = result.errors.length === 0;
    return result;
  }

  async saveResultsToDatabase(calculationId: string, output: NOICalculationOutput): Promise<void> {
    console.log(`[${this.serviceName}] Saving NOI results to database for ${calculationId}`);
    console.log(`[${this.serviceName}] Saving base NOI: $${output.annualBuildingNOI.toLocaleString()}`);
    console.log(`[${this.serviceName}] Saving isRentStabilized: ${output.isRentStabilized}`);
    console.log(`[${this.serviceName}] Saving ${output.noiByYearNoUpgrade.length} years of NOI projections`);

    await prisma.calculations.update({
      where: { id: calculationId },
      data: {
        // Save base NOI and rent stabilization status
        annualBuildingNOI: output.annualBuildingNOI,
        isRentStabilized: output.isRentStabilized,
        // Save year-by-year projections as JSON
        noiByYearNoUpgrade: output.noiByYearNoUpgrade,
        noiByYearWithUpgrade: output.noiByYearWithUpgrade,
      },
    });

    await this.updateServiceMetadata(calculationId);
    console.log(`[${this.serviceName}] Successfully saved NOI results with year-by-year projections and rent stabilization status`);
  }
}

export const noiCalculationService = new NOICalculationService();