/**
 * NOI (Net Operating Income) Calculation Service
 * Implements NOI analysis from LaTeX Section 9
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
import { NOI_CONSTANTS } from '../constants/noi-constants';

export class NOICalculationService extends BaseCalculationService<
  NOICalculationInput,
  NOICalculationOutput,
  NOICalculationOverrides
> {
  readonly serviceName = 'noi' as const;
  readonly version = '1.0.0';
  readonly dependencies = ['financial'] as const;

  calculate(input: NOICalculationInput): NOICalculationOutput {
    console.log(`[${this.serviceName}] Calculating NOI analysis`);

    // Apply defaults
    const config = {
      rentIncreasePercentage: input.rentIncreasePercentage ?? NOI_CONSTANTS.rentIncreasePercentage,
      utilitiesIncludedInRent: input.utilitiesIncludedInRent ?? NOI_CONSTANTS.utilitiesIncludedInRent,
      operatingExpenseRatio: input.operatingExpenseRatio ?? NOI_CONSTANTS.operatingExpenseRatio,
      vacancyRate: input.vacancyRate ?? NOI_CONSTANTS.vacancyRate,
    };

    // Step 1: Calculate potential rental income impact
    const potentialRentalIncomeImpact = this.calculateRentalIncomeImpact(input, config);

    // Step 2: Calculate operating expense savings
    const operatingExpenseSavings = this.calculateOperatingExpenseSavings(input, config);

    // Step 3: Calculate NOI impact
    const noiImpact = potentialRentalIncomeImpact + operatingExpenseSavings;

    // Step 4: Calculate effective gross income changes
    const effectiveGrossIncomeChange = this.calculateEffectiveGrossIncomeChange(
      input,
      potentialRentalIncomeImpact,
      config
    );

    // Step 5: Calculate net operating income change
    const netOperatingIncomeChange = effectiveGrossIncomeChange + operatingExpenseSavings;

    // Step 6: Calculate metrics
    const metrics = this.calculateNOIMetrics(input, netOperatingIncomeChange, config);

    const result: NOICalculationOutput = {
      calculationId: input.calculationId,
      lastCalculated: new Date(),
      serviceVersion: this.version,

      // Rental income impact
      potentialRentalIncomeImpact,
      utilitiesIncludedInRent: config.utilitiesIncludedInRent,
      rentIncreasePercentage: config.rentIncreasePercentage,

      // Operating expense savings
      operatingExpenseSavings,
      
      // NOI calculations
      noiImpact,
      effectiveGrossIncomeChange,
      netOperatingIncomeChange,

      // Metrics
      ...metrics,

      // Configuration used
      noiConfig: config,
    };

    console.log(`[${this.serviceName}] NOI Impact: $${noiImpact.toLocaleString()}`);
    console.log(`[${this.serviceName}] ROI from NOI: ${metrics.roiFromNOI.toFixed(2)}%`);

    return result;
  }

  private calculateRentalIncomeImpact(
    input: NOICalculationInput,
    config: typeof NOI_CONSTANTS
  ): number {
    if (!config.utilitiesIncludedInRent) {
      return 0;
    }

    // If utilities are included in rent, energy savings can increase potential rent
    const annualEnergySavings = input.annualEnergySavings;
    const rentIncreaseFromSavings = annualEnergySavings * (config.rentIncreasePercentage / 100);
    
    return rentIncreaseFromSavings;
  }

  private calculateOperatingExpenseSavings(
    input: NOICalculationInput,
    config: typeof NOI_CONSTANTS
  ): number {
    // Direct energy cost savings reduce operating expenses
    return input.annualEnergySavings;
  }

  private calculateEffectiveGrossIncomeChange(
    input: NOICalculationInput,
    potentialRentalIncomeImpact: number,
    config: typeof NOI_CONSTANTS
  ): number {
    // Effective Gross Income = Potential Rental Income × (1 - Vacancy Rate)
    return potentialRentalIncomeImpact * (1 - config.vacancyRate / 100);
  }

  private calculateNOIMetrics(
    input: NOICalculationInput,
    netOperatingIncomeChange: number,
    config: typeof NOI_CONSTANTS
  ) {
    // Calculate current NOI estimate
    const estimatedCurrentNOI = input.buildingValue * (input.capRate / 100);
    
    // Calculate new NOI
    const newNOI = estimatedCurrentNOI + netOperatingIncomeChange;
    
    // NOI yield on retrofit investment
    const noiYieldOnInvestment = input.totalRetrofitCost > 0 
      ? (netOperatingIncomeChange / input.totalRetrofitCost) * 100 
      : 0;

    // ROI from NOI perspective
    const roiFromNOI = noiYieldOnInvestment;

    // Payback period from NOI perspective
    const noiPaybackPeriod = netOperatingIncomeChange > 0 
      ? input.totalRetrofitCost / netOperatingIncomeChange 
      : -1;

    return {
      estimatedCurrentNOI,
      newNOI,
      noiYieldOnInvestment,
      roiFromNOI,
      noiPaybackPeriod,
    };
  }

  buildInputFromCalculation(
    calculation: Calculations,
    overrides?: NOICalculationOverrides
  ): NOICalculationInput {
    const baseInput: NOICalculationInput = {
      calculationId: calculation.id,
      buildingValue: parseFloat(calculation.buildingValue) || 1000000,
      capRate: parseFloat(calculation.capRate) || 5.5,
      totalRetrofitCost: calculation.totalRetrofitCost || 0,
      annualEnergySavings: calculation.annualEnergySavings || 0,
    };

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

    await prisma.calculations.update({
      where: { id: calculationId },
      data: {
        // Map to existing schema fields - using currentNOI as the main NOI field
        currentNOI: output.estimatedCurrentNOI,
        // Store additional NOI data in the existing period-based fields
        noiNoUpgrade2024to2029: output.estimatedCurrentNOI,
        noiWithUpgrade2024to2027: output.newNOI,
      },
    });

    await this.updateServiceMetadata(calculationId);
    console.log(`[${this.serviceName}] Successfully saved NOI results`);
  }
}

export const noiCalculationService = new NOICalculationService();