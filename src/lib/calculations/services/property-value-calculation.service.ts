/**
 * Property Value Calculation Service
 * Implements property value analysis from LaTeX Section 10 with year-by-year calculations
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

export class PropertyValueCalculationService extends BaseCalculationService<
  PropertyValueCalculationInput,
  PropertyValueCalculationOutput,
  PropertyValueCalculationOverrides
> {
  readonly serviceName = 'property-value' as const;
  readonly version = '1.0.0';
  readonly dependencies = ['noi'] as const;

  calculate(input: PropertyValueCalculationInput): PropertyValueCalculationOutput {
    console.log(`[${this.serviceName}] Starting property value analysis with cap rate: ${input.capRate || 4.0}%`);

    // Apply defaults
    const capRate = input.capRate ?? 4.0; // 4% default cap rate

    // Calculate year-by-year property values following LaTeX specification
    const propertyValueByYearNoUpgrade = this.calculatePropertyValueByYear(
      input.noiByYearNoUpgrade,
      capRate
    );

    const propertyValueByYearWithUpgrade = this.calculatePropertyValueByYear(
      input.noiByYearWithUpgrade,
      capRate
    );

    // Calculate summary metrics (using first year values)
    const propertyValueNoUpgrade = propertyValueByYearNoUpgrade[0]?.value || 0;
    const propertyValueWithUpgrade = propertyValueByYearWithUpgrade[0]?.value || 0;
    const netPropertyValueGain = propertyValueWithUpgrade - propertyValueNoUpgrade;

    // Calculate investment metrics
    const investmentMetrics = this.calculateInvestmentMetrics(
      netPropertyValueGain,
      0 // We'll need retrofit cost from a different source
    );

    console.log(`[${this.serviceName}] Property value analysis:`);
    console.log(`[${this.serviceName}] - No upgrade (Year 1): $${propertyValueNoUpgrade.toLocaleString()}`);
    console.log(`[${this.serviceName}] - With upgrade (Year 1): $${propertyValueWithUpgrade.toLocaleString()}`);
    console.log(`[${this.serviceName}] - Net gain: $${netPropertyValueGain.toLocaleString()}`);
    console.log(`[${this.serviceName}] - Generated ${propertyValueByYearNoUpgrade.length} years of property value projections`);

    const result: PropertyValueCalculationOutput = {
      calculationId: input.calculationId,
      lastCalculated: new Date(),
      serviceVersion: this.version,

      // Summary values
      propertyValueNoUpgrade,
      propertyValueWithUpgrade,
      netPropertyValueGain,

      // Year-by-year projections
      propertyValueByYearNoUpgrade,
      propertyValueByYearWithUpgrade,

      // Investment metrics
      investmentMetrics,

      // Configuration used
      capRate,
    };

    return result;
  }

  /**
   * Calculate property value for each year using NOI / cap rate
   * Following LaTeX functions: calculatePropertyValueNoUpgrade() and calculatePropertyValueUpgrade()
   */
  private calculatePropertyValueByYear(
    noiByYear: Array<{year: number, noi: number}>,
    capRate: number
  ): Array<{year: number, value: number}> {
    return noiByYear.map(item => ({
      year: item.year,
      value: item.noi / (capRate / 100) // NOI / cap rate = property value
    }));
  }

  /**
   * Calculate investment metrics for property value analysis
   */
  private calculateInvestmentMetrics(netPropertyValueGain: number, retrofitCost: number) {
    return {
      valueToRetrofitCostRatio: retrofitCost > 0 ? netPropertyValueGain / retrofitCost : 0,
      equityCreated: netPropertyValueGain,
      leverageMultiplier: retrofitCost > 0 ? netPropertyValueGain / retrofitCost : 0,
    };
  }

  buildInputFromCalculation(
    calculation: Calculations,
    overrides?: PropertyValueCalculationOverrides
  ): PropertyValueCalculationInput {
    // Extract NOI arrays from the calculation
    const noiByYearNoUpgrade = (calculation.noiByYearNoUpgrade as Array<{year: number, noi: number}>) || [];
    const noiByYearWithUpgrade = (calculation.noiByYearWithUpgrade as Array<{year: number, noi: number}>) || [];

    const baseInput: PropertyValueCalculationInput = {
      calculationId: calculation.id,
      noiByYearNoUpgrade,
      noiByYearWithUpgrade,
    };

    return { ...baseInput, ...overrides };
  }

  validateInput(input: PropertyValueCalculationInput): OverrideValidationResult {
    const result: OverrideValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    if (!input.noiByYearNoUpgrade || input.noiByYearNoUpgrade.length === 0) {
      result.errors.push({
        field: 'noiByYearNoUpgrade',
        message: 'NOI year-by-year data without upgrade is required',
      });
    }

    if (!input.noiByYearWithUpgrade || input.noiByYearWithUpgrade.length === 0) {
      result.errors.push({
        field: 'noiByYearWithUpgrade',
        message: 'NOI year-by-year data with upgrade is required',
      });
    }

    if (input.capRate !== undefined && (input.capRate <= 0 || input.capRate > 20)) {
      result.warnings.push({
        field: 'capRate',
        message: 'Cap rate should typically be between 1% and 15%',
      });
    }

    result.valid = result.errors.length === 0;
    return result;
  }

  async saveResultsToDatabase(calculationId: string, output: PropertyValueCalculationOutput): Promise<void> {
    console.log(`[${this.serviceName}] Saving property value results to database for ${calculationId}`);
    console.log(`[${this.serviceName}] Net property value gain: $${output.netPropertyValueGain.toLocaleString()}`);
    console.log(`[${this.serviceName}] Saving ${output.propertyValueByYearNoUpgrade.length} years of property value projections`);

    await prisma.calculations.update({
      where: { id: calculationId },
      data: {
        // Summary values
        propertyValueNoUpgrade: output.propertyValueNoUpgrade,
        propertyValueWithUpgrade: output.propertyValueWithUpgrade,
        netPropertyValueGain: output.netPropertyValueGain,
        // Year-by-year projections as JSON
        propertyValueByYearNoUpgrade: output.propertyValueByYearNoUpgrade,
        propertyValueByYearWithUpgrade: output.propertyValueByYearWithUpgrade,
      },
    });

    await this.updateServiceMetadata(calculationId);
    console.log(`[${this.serviceName}] Successfully saved property value results with year-by-year projections`);
  }
}

export const propertyValueCalculationService = new PropertyValueCalculationService();