/**
 * Property Value Calculation Service
 * Implements property value analysis from LaTeX Section 10
 */

import { BaseCalculationService } from './base-calculation.service';
import { Calculations } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  PropertyValueCalculationInput,
  PropertyValueCalculationOutput,
  PropertyValueCalculationOverrides,
  OverrideValidationResult,
} from '../types';
import { PROPERTY_VALUE_CONSTANTS } from '../constants/property-value-constants';

export class PropertyValueCalculationService extends BaseCalculationService<
  PropertyValueCalculationInput,
  PropertyValueCalculationOutput,
  PropertyValueCalculationOverrides
> {
  readonly serviceName = 'property-value' as const;
  readonly version = '1.0.0';
  readonly dependencies = ['noi'] as const;

  calculate(input: PropertyValueCalculationInput): PropertyValueCalculationOutput {
    console.log(`[${this.serviceName}] Calculating property value impact`);

    // Apply defaults
    const config = {
      capRate: input.capRate ?? PROPERTY_VALUE_CONSTANTS.capRate,
      greenPremiumPercentage: input.greenPremiumPercentage ?? PROPERTY_VALUE_CONSTANTS.greenPremiumPercentage,
      energyEfficiencyPremium: input.energyEfficiencyPremium ?? PROPERTY_VALUE_CONSTANTS.energyEfficiencyPremium,
      marketAppreciationRate: input.marketAppreciationRate ?? PROPERTY_VALUE_CONSTANTS.marketAppreciationRate,
    };

    // Step 1: Calculate NOI-based value increase
    const noiBasedValueIncrease = this.calculateNOIBasedValueIncrease(input, config);

    // Step 2: Calculate green premium value increase
    const greenPremiumValueIncrease = this.calculateGreenPremiumValueIncrease(input, config);

    // Step 3: Calculate energy efficiency premium
    const energyEfficiencyValueIncrease = this.calculateEnergyEfficiencyPremium(input, config);

    // Step 4: Calculate total property value increase
    const totalPropertyValueIncrease = Math.max(
      noiBasedValueIncrease,
      greenPremiumValueIncrease + energyEfficiencyValueIncrease
    );

    // Step 5: Calculate new property value
    const newPropertyValue = input.currentPropertyValue + totalPropertyValueIncrease;

    // Step 6: Calculate return metrics
    const returnMetrics = this.calculateReturnMetrics(
      input,
      totalPropertyValueIncrease,
      newPropertyValue,
      config
    );

    // Step 7: Calculate financing impact
    const financingImpact = this.calculateFinancingImpact(input, totalPropertyValueIncrease);

    const result: PropertyValueCalculationOutput = {
      calculationId: input.calculationId,
      lastCalculated: new Date(),
      serviceVersion: this.version,

      // Value increases by method
      noiBasedValueIncrease,
      greenPremiumValueIncrease,
      energyEfficiencyValueIncrease,
      totalPropertyValueIncrease,

      // Property values
      currentPropertyValue: input.currentPropertyValue,
      newPropertyValue,

      // Return metrics
      ...returnMetrics,

      // Financing impact
      ...financingImpact,

      // Configuration used
      propertyValueConfig: config,
    };

    console.log(`[${this.serviceName}] Property value increase: $${totalPropertyValueIncrease.toLocaleString()}`);
    console.log(`[${this.serviceName}] Value creation ROI: ${returnMetrics.valueCreationROI.toFixed(2)}%`);

    return result;
  }

  private calculateNOIBasedValueIncrease(
    input: PropertyValueCalculationInput,
    config: typeof PROPERTY_VALUE_CONSTANTS
  ): number {
    // Property value increase based on NOI improvement
    // Value = NOI / Cap Rate
    return input.netOperatingIncomeChange / (config.capRate / 100);
  }

  private calculateGreenPremiumValueIncrease(
    input: PropertyValueCalculationInput,
    config: typeof PROPERTY_VALUE_CONSTANTS
  ): number {
    // Green buildings typically command a premium in the market
    return input.currentPropertyValue * (config.greenPremiumPercentage / 100);
  }

  private calculateEnergyEfficiencyPremium(
    input: PropertyValueCalculationInput,
    config: typeof PROPERTY_VALUE_CONSTANTS
  ): number {
    // Additional premium specifically for energy efficiency improvements
    const energyReductionFactor = Math.min(input.energyReductionPercentage / 100, 0.5); // Cap at 50%
    return input.currentPropertyValue * (config.energyEfficiencyPremium / 100) * energyReductionFactor;
  }

  private calculateReturnMetrics(
    input: PropertyValueCalculationInput,
    totalPropertyValueIncrease: number,
    newPropertyValue: number,
    config: typeof PROPERTY_VALUE_CONSTANTS
  ) {
    // Value creation ROI
    const valueCreationROI = input.totalRetrofitCost > 0 
      ? (totalPropertyValueIncrease / input.totalRetrofitCost) * 100 
      : 0;

    // Property appreciation percentage
    const propertyAppreciationPercentage = input.currentPropertyValue > 0 
      ? (totalPropertyValueIncrease / input.currentPropertyValue) * 100 
      : 0;

    // Loan-to-value impact (assuming typical 75% LTV)
    const newLoanCapacity = newPropertyValue * 0.75;
    const currentLoanCapacity = input.currentPropertyValue * 0.75;
    const additionalLoanCapacity = newLoanCapacity - currentLoanCapacity;

    // Net benefit (value increase minus retrofit cost)
    const netBenefit = totalPropertyValueIncrease - input.totalRetrofitCost;

    // Payback from value perspective
    const valuePaybackPeriod = totalPropertyValueIncrease > 0 
      ? input.totalRetrofitCost / (totalPropertyValueIncrease * (config.marketAppreciationRate / 100))
      : -1;

    return {
      valueCreationROI,
      propertyAppreciationPercentage,
      additionalLoanCapacity,
      netBenefit,
      valuePaybackPeriod,
    };
  }

  private calculateFinancingImpact(
    input: PropertyValueCalculationInput,
    totalPropertyValueIncrease: number
  ) {
    // Potential refinancing benefits
    const refinancingBenefit = totalPropertyValueIncrease * 0.75; // Typical 75% LTV

    // Debt service coverage ratio improvement (from NOI increase)
    const dscrImprovement = input.netOperatingIncomeChange / (input.totalRetrofitCost * 0.08); // Assume 8% debt service

    // Improved creditworthiness indicator
    const creditworthinessImprovement = Math.min(dscrImprovement, 0.5); // Cap improvement

    return {
      refinancingBenefit,
      dscrImprovement,
      creditworthinessImprovement,
    };
  }

  buildInputFromCalculation(
    calculation: Calculations,
    overrides?: PropertyValueCalculationOverrides
  ): PropertyValueCalculationInput {
    const baseInput: PropertyValueCalculationInput = {
      calculationId: calculation.id,
      currentPropertyValue: parseFloat(calculation.buildingValue) || 1000000,
      totalRetrofitCost: calculation.totalRetrofitCost || 0,
      netOperatingIncomeChange: calculation.netOperatingIncomeChange || 0,
      energyReductionPercentage: calculation.energyReductionPercentage || 0,
    };

    return { ...baseInput, ...overrides };
  }

  validateInput(input: PropertyValueCalculationInput): OverrideValidationResult {
    const result: OverrideValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    if (!input.currentPropertyValue || input.currentPropertyValue <= 0) {
      result.errors.push({
        field: 'currentPropertyValue',
        message: 'Current property value must be greater than 0',
      });
    }

    if (!input.totalRetrofitCost || input.totalRetrofitCost <= 0) {
      result.errors.push({
        field: 'totalRetrofitCost',
        message: 'Total retrofit cost must be greater than 0',
      });
    }

    if (input.capRate !== undefined && (input.capRate <= 0 || input.capRate > 20)) {
      result.warnings.push({
        field: 'capRate',
        message: 'Cap rate should typically be between 1% and 15%',
      });
    }

    if (input.greenPremiumPercentage !== undefined && (input.greenPremiumPercentage < 0 || input.greenPremiumPercentage > 20)) {
      result.warnings.push({
        field: 'greenPremiumPercentage',
        message: 'Green premium should typically be between 0% and 10%',
      });
    }

    result.valid = result.errors.length === 0;
    return result;
  }

  async saveResultsToDatabase(calculationId: string, output: PropertyValueCalculationOutput): Promise<void> {
    console.log(`[${this.serviceName}] Saving property value results to database for ${calculationId}`);

    await prisma.calculations.update({
      where: { id: calculationId },
      data: {
        // Map to existing schema fields
        propertyValueNoUpgrade: output.currentPropertyValue,
        propertyValueWithUpgrade: output.newPropertyValue,
        netPropertyValueGain: output.totalPropertyValueIncrease,
      },
    });

    await this.updateServiceMetadata(calculationId);
    console.log(`[${this.serviceName}] Successfully saved property value results`);
  }
}

export const propertyValueCalculationService = new PropertyValueCalculationService();