/**
 * LL97 Calculation Service
 * Implements Local Law 97 emissions and compliance calculations from LaTeX Section 7
 */

import { BaseCalculationService } from './base-calculation.service';
import { Calculations } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  LL97CalculationInput,
  LL97CalculationOutput,
  LL97CalculationOverrides,
  OverrideValidationResult,
} from '../types';
import {
  LL97_CONSTANTS,
  getGridEmissionsFactor,
  getCompliancePeriod,
  getBECreditCoefficient,
} from '../constants/ll97-constants';
import { parsePropertyUse, normalizePropertyType, PropertyUse } from '../utils/property-use-parser';
import * as fs from 'fs';
import * as path from 'path';

// Interface for LL97 emissions limits data
interface LL97EmissionsLimit {
  espm_property_type: string;
  esmp_category: string;
  bc_occupancy_group: string;
  bc_group_for_caps: string;
  b_special: boolean;
  limit_2024_2029: number;
  limit_2030_2034: number;
  suggested_property_type: string;
  coverage: string;
  limit_2035_2039: number;
  limit_2040_2049: number;
}

export class LL97CalculationService extends BaseCalculationService<
  LL97CalculationInput,
  LL97CalculationOutput,
  LL97CalculationOverrides
> {
  readonly serviceName = 'll97' as const;
  readonly version = '1.0.0';
  readonly dependencies = ['energy'] as const;
  
  private emissionsLimits: LL97EmissionsLimit[] | null = null;

  /**
   * Loads LL97 emissions limits from JSON file
   */
  private getEmissionsLimits(): LL97EmissionsLimit[] {
    if (this.emissionsLimits === null) {
      try {
        const jsonPath = path.join(process.cwd(), 'll97_espm_to_bc_caps_with_2035_2049.json');
        const jsonData = fs.readFileSync(jsonPath, 'utf8');
        this.emissionsLimits = JSON.parse(jsonData) as LL97EmissionsLimit[];
      } catch (error) {
        console.error('Failed to load LL97 emissions limits:', error);
        this.emissionsLimits = [];
      }
    }
    return this.emissionsLimits;
  }

  /**
   * Finds emissions limit entry for a given property type
   */
  private findEmissionsLimit(propertyType: string): LL97EmissionsLimit | null {
    const limits = this.getEmissionsLimits();
    const normalizedType = normalizePropertyType(propertyType);
    
    // First try exact match
    let match = limits.find(limit => limit.espm_property_type === normalizedType);
    
    if (!match) {
      // Try case-insensitive match
      match = limits.find(limit => 
        limit.espm_property_type.toLowerCase() === normalizedType.toLowerCase()
      );
    }
    
    if (!match) {
      console.warn(`No emissions limit found for property type: ${propertyType}`);
    }
    
    return match || null;
  }

  /**
   * Main calculation method implementing LaTeX Section 7
   */
  calculate(input: LL97CalculationInput): LL97CalculationOutput {
    console.log(`[${this.serviceName}] Calculating LL97 compliance for building class ${input.buildingClass}`);

    // Apply defaults to overridable constants
    const config = {
      feePerTonCO2e: input.feePerTonCO2e ?? LL97_CONSTANTS.feePerTonCO2e,
      efGas: input.efGas ?? LL97_CONSTANTS.efGas,
      efGrid2024to2029: input.efGrid2024to2029 ?? LL97_CONSTANTS.efGrid2024to2029,
      efGrid2030to2034: input.efGrid2030to2034 ?? LL97_CONSTANTS.efGrid2030to2034,
      beCoefficientBefore2027: input.beCoefficientBefore2027 ?? LL97_CONSTANTS.beCoefficientBefore2027,
      beCoefficient2027to2029: input.beCoefficient2027to2029 ?? LL97_CONSTANTS.beCoefficient2027to2029,
    };

    // Step 1: Calculate emissions budgets for all periods
    const emissionsBudgets = this.calculateEmissionsBudgets(input);

    // Step 2: Calculate current fees (without upgrade)
    const currentFees = this.calculateCurrentFees(input, emissionsBudgets);

    // Step 3: Calculate BE Credits
    const beCredits = this.calculateBECredits(input, config);

    // Step 4: Calculate adjusted emissions (with upgrade)
    const adjustedEmissions = this.calculateAdjustedEmissions(input, config);

    // Step 5: Calculate adjusted fees (with upgrade and BE credits)
    const adjustedFees = this.calculateAdjustedFees(adjustedEmissions, emissionsBudgets, beCredits, config);

    // Calculate compliance insights
    const insights = this.calculateInsights(input, emissionsBudgets, currentFees, beCredits);

    const result: LL97CalculationOutput = {
      calculationId: input.calculationId,
      lastCalculated: new Date(),
      serviceVersion: this.version,

      // Emissions budgets
      ...emissionsBudgets,

      // Current building emissions
      totalBuildingEmissionsLL84: input.totalBuildingEmissionsLL84,

      // Current fees (without upgrade)
      ...currentFees,

      // BE Credits
      ...beCredits,

      // Adjusted emissions (with upgrade)
      ...adjustedEmissions,

      // Adjusted fees (with upgrade and BE credits)
      ...adjustedFees,

      // Analysis insights
      insights,
    };

    console.log(`[${this.serviceName}] Worst case LL97 fee: $${insights.worstCaseFee.toLocaleString()}`);
    console.log(`[${this.serviceName}] Total BE credit available: ${insights.totalBECreditAvailable.toFixed(2)} tCO2e`);

    return result;
  }

  private calculateEmissionsBudgets(input: LL97CalculationInput) {
    // Parse property use breakdown from LL84 data
    const propertyUses = parsePropertyUse(input.propertyUseBreakdown);
    
    if (propertyUses.length === 0) {
      console.warn('No property use breakdown available, falling back to building class estimation');
      return this.calculateFallbackEmissionsBudgets(input);
    }

    let emissionsBudget2024to2029 = 0;
    let emissionsBudget2030to2034 = 0;
    let emissionsBudget2035to2039 = 0;
    let emissionsBudget2040to2049 = 0;

    // Calculate emissions budget for each property type and sum them
    for (const propertyUse of propertyUses) {
      const emissionsLimit = this.findEmissionsLimit(propertyUse.propertyType);
      
      if (emissionsLimit) {
        // Convert from tCO2e/sf to building total (multiply by square footage)
        emissionsBudget2024to2029 += propertyUse.squareFeet * emissionsLimit.limit_2024_2029;
        emissionsBudget2030to2034 += propertyUse.squareFeet * emissionsLimit.limit_2030_2034;
        emissionsBudget2035to2039 += propertyUse.squareFeet * emissionsLimit.limit_2035_2039;
        emissionsBudget2040to2049 += propertyUse.squareFeet * emissionsLimit.limit_2040_2049;
      } else {
        // Throw error instead of falling back - we want to identify missing property types
        throw new Error(`No emissions limit found for property type: ${propertyUse.propertyType}. Please update the LL97 property type mapping.`);
      }
    }
    
    console.log(`[${this.serviceName}] Calculated emissions budgets from ${propertyUses.length} property types`);
    
    return {
      emissionsBudget2024to2029,
      emissionsBudget2030to2034,
      emissionsBudget2035to2039,
      emissionsBudget2040to2049,
    };
  }

  /**
   * Fallback emissions budget calculation when property use breakdown is not available
   */
  private calculateFallbackEmissionsBudgets(input: LL97CalculationInput) {
    // Use simplified calculation based on building size and type as before
    const baseEmissionsLimit = this.getEmissionsLimitForBuildingClass(input.buildingClass);
    
    return {
      emissionsBudget2024to2029: (input.totalSquareFeet / 1000) * baseEmissionsLimit * 0.00892, // Multifamily rate
      emissionsBudget2030to2034: (input.totalSquareFeet / 1000) * baseEmissionsLimit * 0.00453, // Reduced rate
      emissionsBudget2035to2039: (input.totalSquareFeet / 1000) * baseEmissionsLimit * 0.00165234, // Even lower
      emissionsBudget2040to2049: (input.totalSquareFeet / 1000) * baseEmissionsLimit * 0.000581893, // Lowest
    };
  }

  private calculateCurrentFees(
    input: LL97CalculationInput,
    emissionsBudgets: ReturnType<typeof this.calculateEmissionsBudgets>
  ) {
    const calculateFee = (budget: number) => 
      Math.max(0, (input.totalBuildingEmissionsLL84 - budget) * LL97_CONSTANTS.feePerTonCO2e);

    return {
      annualFeeExceedingBudget2024to2029: calculateFee(emissionsBudgets.emissionsBudget2024to2029),
      annualFeeExceedingBudget2030to2034: calculateFee(emissionsBudgets.emissionsBudget2030to2034),
      annualFeeExceedingBudget2035to2039: calculateFee(emissionsBudgets.emissionsBudget2035to2039),
      annualFeeExceedingBudget2040to2049: calculateFee(emissionsBudgets.emissionsBudget2040to2049),
    };
  }

  private calculateBECredits(input: LL97CalculationInput, config: typeof LL97_CONSTANTS) {
    return {
      beCreditBefore2027: input.annualBuildingkWhHeatingPTHP * config.beCoefficientBefore2027,
      beCredit2027to2029: input.annualBuildingkWhHeatingPTHP * config.beCoefficient2027to2029,
    };
  }

  private calculateAdjustedEmissions(input: LL97CalculationInput, config: typeof LL97_CONSTANTS) {
    // Base adjusted emissions: remove gas heating, add electric heating
    const baseAdjustedEmissions = input.totalBuildingEmissionsLL84 
      - (input.annualBuildingMMBtuHeatingPTAC * config.efGas)
      + (input.annualBuildingkWhHeatingPTHP * config.efGrid2024to2029);

    return {
      adjustedTotalBuildingEmissions2024to2029: baseAdjustedEmissions,
      adjustedTotalBuildingEmissions2030to2034: input.totalBuildingEmissionsLL84 
        - (input.annualBuildingMMBtuHeatingPTAC * config.efGas)
        + (input.annualBuildingkWhHeatingPTHP * config.efGrid2030to2034),
      adjustedTotalBuildingEmissions2035to2039: input.totalBuildingEmissionsLL84 
        - (input.annualBuildingMMBtuHeatingPTAC * config.efGas)
        + (input.annualBuildingkWhHeatingPTHP * config.efGrid2030to2034), // Same factor
      adjustedTotalBuildingEmissions2040to2049: input.totalBuildingEmissionsLL84 
        - (input.annualBuildingMMBtuHeatingPTAC * config.efGas)
        + (input.annualBuildingkWhHeatingPTHP * config.efGrid2030to2034), // Same factor
    };
  }

  private calculateAdjustedFees(
    adjustedEmissions: ReturnType<typeof this.calculateAdjustedEmissions>,
    emissionsBudgets: ReturnType<typeof this.calculateEmissionsBudgets>,
    beCredits: ReturnType<typeof this.calculateBECredits>,
    config: typeof LL97_CONSTANTS
  ) {
    const calculateAdjustedFee = (emissions: number, budget: number, beCredit: number = 0) =>
      Math.max(0, (emissions - beCredit - budget) * config.feePerTonCO2e);

    return {
      adjustedAnnualFeeBefore2027: calculateAdjustedFee(
        adjustedEmissions.adjustedTotalBuildingEmissions2024to2029,
        emissionsBudgets.emissionsBudget2024to2029,
        beCredits.beCreditBefore2027
      ),
      adjustedAnnualFee2027to2029: calculateAdjustedFee(
        adjustedEmissions.adjustedTotalBuildingEmissions2024to2029,
        emissionsBudgets.emissionsBudget2024to2029,
        beCredits.beCredit2027to2029
      ),
      adjustedAnnualFee2030to2034: calculateAdjustedFee(
        adjustedEmissions.adjustedTotalBuildingEmissions2030to2034,
        emissionsBudgets.emissionsBudget2030to2034
      ),
      adjustedAnnualFee2035to2039: calculateAdjustedFee(
        adjustedEmissions.adjustedTotalBuildingEmissions2035to2039,
        emissionsBudgets.emissionsBudget2035to2039
      ),
      adjustedAnnualFee2040to2049: calculateAdjustedFee(
        adjustedEmissions.adjustedTotalBuildingEmissions2040to2049,
        emissionsBudgets.emissionsBudget2040to2049
      ),
    };
  }

  private calculateInsights(
    input: LL97CalculationInput,
    emissionsBudgets: ReturnType<typeof this.calculateEmissionsBudgets>,
    currentFees: ReturnType<typeof this.calculateCurrentFees>,
    beCredits: ReturnType<typeof this.calculateBECredits>
  ) {
    const worstCaseFee = Math.max(
      currentFees.annualFeeExceedingBudget2024to2029,
      currentFees.annualFeeExceedingBudget2030to2034,
      currentFees.annualFeeExceedingBudget2035to2039,
      currentFees.annualFeeExceedingBudget2040to2049
    );

    const totalBECreditAvailable = beCredits.beCreditBefore2027 + beCredits.beCredit2027to2029;

    return {
      worstCaseFee,
      totalBECreditAvailable,
      complianceStatus: {
        '2024-2029': input.totalBuildingEmissionsLL84 <= emissionsBudgets.emissionsBudget2024to2029,
        '2030-2034': input.totalBuildingEmissionsLL84 <= emissionsBudgets.emissionsBudget2030to2034,
        '2035-2039': input.totalBuildingEmissionsLL84 <= emissionsBudgets.emissionsBudget2035to2039,
        '2040-2049': input.totalBuildingEmissionsLL84 <= emissionsBudgets.emissionsBudget2040to2049,
      },
    };
  }

  private getEmissionsLimitForBuildingClass(buildingClass: string): number {
    // Simplified mapping - in reality this would use the complex LL97 mapping
    if (buildingClass.startsWith('R')) return 1000; // Residential
    if (buildingClass.startsWith('C')) return 800;  // Commercial
    return 900; // Default
  }

  buildInputFromCalculation(
    calculation: Calculations,
    overrides?: LL97CalculationOverrides
  ): LL97CalculationInput {
    // Extract property use breakdown and emissions from raw LL84 data
    let propertyUseBreakdown: string | undefined;
    let totalBuildingEmissions = calculation.totalBuildingEmissionsLL84;
    
    if (calculation.rawLL84Data) {
      try {
        const ll84Data = calculation.rawLL84Data as Record<string, unknown>;
        propertyUseBreakdown = ll84Data.list_of_all_property_use;
        
        // Use total_location_based_ghg if available, otherwise fall back to stored value or total_ghg_emissions
        if (ll84Data.total_location_based_ghg) {
          totalBuildingEmissions = parseFloat(ll84Data.total_location_based_ghg);
        } else if (ll84Data.total_ghg_emissions) {
          totalBuildingEmissions = parseFloat(ll84Data.total_ghg_emissions);
        }
      } catch (error) {
        console.warn('Failed to extract property use breakdown from raw LL84 data:', error);
      }
    }
    
    const baseInput: LL97CalculationInput = {
      calculationId: calculation.id,
      buildingClass: calculation.buildingClass || 'R6',
      totalSquareFeet: parseFloat(calculation.totalSquareFeet) || 0,
      totalBuildingEmissionsLL84: totalBuildingEmissions || 1250.5, // Default from LaTeX
      propertyUseBreakdown,
      annualBuildingMMBtuHeatingPTAC: calculation.annualBuildingMMBtuHeatingPTAC || 0,
      annualBuildingkWhHeatingPTHP: calculation.annualBuildingkWhHeatingPTHP || 0,
    };

    return { ...baseInput, ...overrides };
  }

  validateInput(input: LL97CalculationInput): OverrideValidationResult {
    const result: OverrideValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    if (!input.totalSquareFeet || input.totalSquareFeet <= 0) {
      result.errors.push({
        field: 'totalSquareFeet',
        message: 'Total square feet must be greater than 0',
      });
    }

    if (!input.totalBuildingEmissionsLL84 || input.totalBuildingEmissionsLL84 <= 0) {
      result.errors.push({
        field: 'totalBuildingEmissionsLL84',
        message: 'Building emissions must be greater than 0',
      });
    }

    result.valid = result.errors.length === 0;
    return result;
  }

  async saveResultsToDatabase(calculationId: string, output: LL97CalculationOutput): Promise<void> {
    console.log(`[${this.serviceName}] Saving LL97 results to database for ${calculationId}`);

    await prisma.calculations.update({
      where: { id: calculationId },
      data: {
        // Emissions budgets
        emissionsBudget2024to2029: output.emissionsBudget2024to2029,
        emissionsBudget2030to2034: output.emissionsBudget2030to2034,
        emissionsBudget2035to2039: output.emissionsBudget2035to2039,
        emissionsBudget2040to2049: output.emissionsBudget2040to2049,

        // Current emissions
        totalBuildingEmissionsLL84: output.totalBuildingEmissionsLL84,

        // Current fees
        annualFeeExceedingBudget2024to2029: output.annualFeeExceedingBudget2024to2029,
        annualFeeExceedingBudget2030to2034: output.annualFeeExceedingBudget2030to2034,
        annualFeeExceedingBudget2035to2039: output.annualFeeExceedingBudget2035to2039,
        annualFeeExceedingBudget2040to2049: output.annualFeeExceedingBudget2040to2049,

        // BE Credits
        beCreditBefore2027: output.beCreditBefore2027,
        beCredit2027to2029: output.beCredit2027to2029,

        // Adjusted emissions
        adjustedTotalBuildingEmissions2024to2029: output.adjustedTotalBuildingEmissions2024to2029,
        adjustedTotalBuildingEmissions2030to2034: output.adjustedTotalBuildingEmissions2030to2034,
        adjustedTotalBuildingEmissions2035to2039: output.adjustedTotalBuildingEmissions2035to2039,
        adjustedTotalBuildingEmissions2040to2049: output.adjustedTotalBuildingEmissions2040to2049,

        // Adjusted fees
        adjustedAnnualFeeBefore2027: output.adjustedAnnualFeeBefore2027,
        adjustedAnnualFee2027to2029: output.adjustedAnnualFee2027to2029,
        adjustedAnnualFee2030to2034: output.adjustedAnnualFee2030to2034,
        adjustedAnnualFee2035to2039: output.adjustedAnnualFee2035to2039,
        adjustedAnnualFee2040to2049: output.adjustedAnnualFee2040to2049,
      },
    });

    await this.updateServiceMetadata(calculationId);
    console.log(`[${this.serviceName}] Successfully saved LL97 results`);
  }
}

export const ll97CalculationService = new LL97CalculationService();