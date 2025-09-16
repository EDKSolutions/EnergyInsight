/**
 * Energy Calculation Service
 * Implements all energy calculations from LaTeX Sections 2-6
 * Extracted from AI service for clean separation of concerns
 */

import { BaseCalculationService } from './base-calculation.service';
import { Calculations } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  EnergyCalculationInput,
  EnergyCalculationOutput,
  EnergyCalculationOverrides,
  OverrideValidationResult,
  ServiceName,
} from '../types';
import {
  ENERGY_CONSTANTS,
  getEFLHFromPluto,
  calculateAnnualBuildingkWhHeatingPTHP,
} from '../constants/energy-constants';

export class EnergyCalculationService extends BaseCalculationService<
  EnergyCalculationInput,
  EnergyCalculationOutput,
  EnergyCalculationOverrides
> {
  readonly serviceName = 'energy' as const;
  readonly version = '1.0.0';
  readonly dependencies = ['ai-breakdown'] as ServiceName[];

  /**
   * Main calculation method implementing LaTeX Sections 2-6
   */
  calculate(input: EnergyCalculationInput): EnergyCalculationOutput {
    console.log(`[${this.serviceName}] Calculating energy metrics for ${input.ptacUnits} PTAC units`);

    // Apply defaults to overridable constants
    const config = {
      annualUnitThermsHeatingPTAC: input.annualUnitThermsHeatingPTAC ?? ENERGY_CONSTANTS.annualUnitThermsHeatingPTAC,
      annualUnitKwhCoolingPTAC: input.annualUnitKwhCoolingPTAC ?? ENERGY_CONSTANTS.annualUnitKwhCoolingPTAC,
      annualUnitMMBtuHeatingPTAC: input.annualUnitMMBtuHeatingPTAC ?? ENERGY_CONSTANTS.annualUnitMMBtuHeatingPTAC,
      annualUnitMMBtuCoolingPTAC: input.annualUnitMMBtuCoolingPTAC ?? ENERGY_CONSTANTS.annualUnitMMBtuCoolingPTAC,
      heatingCapacityPTHP: input.heatingCapacityPTHP ?? ENERGY_CONSTANTS.heatingCapacityPTHP,
      pthpCOP: input.pthpCOP ?? ENERGY_CONSTANTS.pthpCOP,
      pthpUnitCost: input.pthpUnitCost ?? ENERGY_CONSTANTS.pthpUnitCost,
      pthpInstallationCost: input.pthpInstallationCost ?? ENERGY_CONSTANTS.pthpInstallationCost,
      pthpContingency: input.pthpContingency ?? ENERGY_CONSTANTS.pthpContingency,
      priceKwhHour: input.priceKwhHour ?? ENERGY_CONSTANTS.priceKwhHour,
      priceThermHour: input.priceThermHour ?? ENERGY_CONSTANTS.priceThermHour,
    };

    // Step 1: Calculate EFLH from building characteristics
    const eflhHours = getEFLHFromPluto(input.yearBuilt, input.numFloors);
    console.log(`[${this.serviceName}] EFLH hours: ${eflhHours}`);

    // Section 2.2 - Building-Level PTAC Calculations
    const annualBuildingMMBtuCoolingPTAC = input.ptacUnits * config.annualUnitMMBtuCoolingPTAC;
    const annualBuildingMMBtuHeatingPTAC = input.ptacUnits * config.annualUnitMMBtuHeatingPTAC;
    const annualBuildingMMBtuTotalPTAC = annualBuildingMMBtuCoolingPTAC + annualBuildingMMBtuHeatingPTAC;

    // Original unit calculations for cost analysis
    const annualBuildingThermsHeatingPTAC = input.ptacUnits * config.annualUnitThermsHeatingPTAC;
    const annualBuildingkWhCoolingPTAC = input.ptacUnits * config.annualUnitKwhCoolingPTAC;
    const annualBuildingCostPTAC = 
      (annualBuildingkWhCoolingPTAC * config.priceKwhHour) +
      (annualBuildingThermsHeatingPTAC * config.priceThermHour);

    // Section 3 - PTHP Building Calculations (with EFLH for accuracy)
    const annualBuildingkWhHeatingPTHP = calculateAnnualBuildingkWhHeatingPTHP(
      input.ptacUnits,
      eflhHours,
      config.heatingCapacityPTHP,
      config.pthpCOP
    );
    const annualBuildingMMBtuHeatingPTHP = annualBuildingkWhHeatingPTHP * ENERGY_CONSTANTS.kwhToMMBtu;
    const annualBuildingMMBtuCoolingPTHP = annualBuildingMMBtuCoolingPTAC; // Same as PTAC
    const annualBuildingMMBtuTotalPTHP = annualBuildingMMBtuHeatingPTHP + annualBuildingMMBtuCoolingPTHP;

    // PTHP cost calculations
    const annualBuildingkWhCoolingPTHP = annualBuildingkWhCoolingPTAC; // Same as PTAC
    const annualBuildingCostPTHP = 
      (annualBuildingkWhHeatingPTHP * config.priceKwhHour) +
      (annualBuildingkWhCoolingPTHP * config.priceKwhHour);

    // Section 4 - Energy Reduction Analysis
    const energyReductionPercentage = ((annualBuildingMMBtuTotalPTAC - annualBuildingMMBtuTotalPTHP) / annualBuildingMMBtuTotalPTAC) * 100;

    // Section 5 - Retrofit Cost Calculation
    const totalRetrofitCost = (config.pthpUnitCost + config.pthpInstallationCost) * input.ptacUnits * (1 + config.pthpContingency);

    // Section 6 - Energy Cost Savings
    const annualEnergySavings = annualBuildingCostPTAC - annualBuildingCostPTHP;

    const result: EnergyCalculationOutput = {
      calculationId: input.calculationId,
      lastCalculated: new Date(),
      serviceVersion: this.version,

      // EFLH calculation
      eflhHours,

      // Section 2.2 - PTAC calculations
      annualBuildingMMBtuCoolingPTAC,
      annualBuildingMMBtuHeatingPTAC,
      annualBuildingMMBtuTotalPTAC,
      annualBuildingThermsHeatingPTAC,
      annualBuildingkWhCoolingPTAC,
      annualBuildingCostPTAC,

      // Section 3 - PTHP calculations
      annualBuildingkWhHeatingPTHP,
      annualBuildingMMBtuHeatingPTHP,
      annualBuildingMMBtuCoolingPTHP,
      annualBuildingMMBtuTotalPTHP,
      annualBuildingkWhCoolingPTHP,
      annualBuildingCostPTHP,

      // Section 4 - Energy reduction analysis
      energyReductionPercentage,

      // Section 5 - Retrofit cost calculation
      totalRetrofitCost,

      // Section 6 - Energy cost savings
      annualEnergySavings,

      // Configuration used (for transparency and debugging)
      configurationUsed: {
        ptacUnits: input.ptacUnits,
        eflhHours,
        pthpCOP: config.pthpCOP,
        priceKwhHour: config.priceKwhHour,
        priceThermHour: config.priceThermHour,
        pthpUnitCost: config.pthpUnitCost,
        pthpInstallationCost: config.pthpInstallationCost,
        pthpContingency: config.pthpContingency,
      },
    };

    console.log(`[${this.serviceName}] Energy reduction: ${energyReductionPercentage.toFixed(2)}%`);
    console.log(`[${this.serviceName}] Annual savings: $${annualEnergySavings.toFixed(2)}`);

    return result;
  }

  /**
   * Build input from database calculation record with optional overrides
   */
  buildInputFromCalculation(
    calculation: Calculations,
    overrides?: EnergyCalculationOverrides
  ): EnergyCalculationInput {
    const baseInput: EnergyCalculationInput = {
      calculationId: calculation.id,
      ptacUnits: calculation.ptacUnits || 0,
      yearBuilt: calculation.yearBuilt || 1980,
      numFloors: calculation.stories || 6,
    };

    // Apply overrides if provided
    return { ...baseInput, ...overrides };
  }

  /**
   * Validate input parameters
   */
  validateInput(input: EnergyCalculationInput): OverrideValidationResult {
    const result: OverrideValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // Validate required fields
    if (!input.ptacUnits || input.ptacUnits <= 0) {
      result.errors.push({
        field: 'ptacUnits',
        message: 'PTAC units must be greater than 0',
      });
    }

    if (!input.yearBuilt || input.yearBuilt < 1800 || input.yearBuilt > new Date().getFullYear()) {
      result.errors.push({
        field: 'yearBuilt',
        message: 'Year built must be between 1800 and current year',
      });
    }

    if (!input.numFloors || input.numFloors < 1 || input.numFloors > 200) {
      result.errors.push({
        field: 'numFloors',
        message: 'Number of floors must be between 1 and 200',
      });
    }

    // Validate overridable constants (if provided)
    if (input.pthpCOP !== undefined && (input.pthpCOP <= 0 || input.pthpCOP > 10)) {
      result.warnings.push({
        field: 'pthpCOP',
        message: 'PTHP COP should typically be between 1.0 and 4.0',
      });
    }

    if (input.priceKwhHour !== undefined && (input.priceKwhHour <= 0 || input.priceKwhHour > 1)) {
      result.warnings.push({
        field: 'priceKwhHour',
        message: 'Electricity price per kWh seems unusually high or low',
      });
    }

    result.valid = result.errors.length === 0;
    return result;
  }

  /**
   * Save energy calculation results to database
   */
  async saveResultsToDatabase(calculationId: string, output: EnergyCalculationOutput): Promise<void> {
    console.log(`[${this.serviceName}] Saving results to database for ${calculationId}`);

    await prisma.calculations.update({
      where: { id: calculationId },
      data: {
        // EFLH data
        eflhHours: output.eflhHours,
        annualBuildingkWhHeatingPTHP: output.annualBuildingkWhHeatingPTHP,

        // Section 2.2 - Building-Level PTAC Calculations
        annualBuildingMMBtuCoolingPTAC: output.annualBuildingMMBtuCoolingPTAC,
        annualBuildingMMBtuHeatingPTAC: output.annualBuildingMMBtuHeatingPTAC,
        annualBuildingMMBtuTotalPTAC: output.annualBuildingMMBtuTotalPTAC,
        annualBuildingThermsHeatingPTAC: output.annualBuildingThermsHeatingPTAC,
        annualBuildingkWhCoolingPTAC: output.annualBuildingkWhCoolingPTAC,
        annualBuildingCostPTAC: output.annualBuildingCostPTAC,

        // Section 3 - PTHP Building Calculations
        annualBuildingMMBtuHeatingPTHP: output.annualBuildingMMBtuHeatingPTHP,
        annualBuildingMMBtuCoolingPTHP: output.annualBuildingMMBtuCoolingPTHP,
        annualBuildingMMBtuTotalPTHP: output.annualBuildingMMBtuTotalPTHP,
        annualBuildingkWhCoolingPTHP: output.annualBuildingkWhCoolingPTHP,
        annualBuildingCostPTHP: output.annualBuildingCostPTHP,

        // Section 4 - Energy Reduction Analysis
        energyReductionPercentage: output.energyReductionPercentage,

        // Section 5 - Retrofit Cost Calculation
        totalRetrofitCost: output.totalRetrofitCost,

        // Section 6 - Energy Cost Savings
        annualEnergySavings: output.annualEnergySavings,

        // Energy pricing used in calculations (for user reference and overrides)
        priceKwhHour: output.configurationUsed.priceKwhHour,
        priceThermHour: output.configurationUsed.priceThermHour,
      },
    });

    // Update service metadata
    await this.updateServiceMetadata(calculationId);

    console.log(`[${this.serviceName}] Successfully saved energy calculation results`);
  }
}

// Export singleton instance
export const energyCalculationService = new EnergyCalculationService();
