/**
 * Financial Calculation Service
 * Implements financial analysis from LaTeX Section 8
 */

import { BaseCalculationService } from './base-calculation.service';
import { Calculations } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  FinancialCalculationInput,
  FinancialCalculationOutput,
  FinancialCalculationOverrides,
  OverrideValidationResult,
} from '../types';
import {
  FINANCIAL_CONSTANTS,
  calculateMonthlyPayment,
  generateLoanBalanceArray,
  calculateSimplePaybackPeriod,
  generateAnalysisYears,
  defaultFinancialConfig,
} from '../constants/financial-constants';

export class FinancialCalculationService extends BaseCalculationService<
  FinancialCalculationInput,
  FinancialCalculationOutput,
  FinancialCalculationOverrides
> {
  readonly serviceName = 'financial' as const;
  readonly version = '1.0.0';
  readonly dependencies = ['energy', 'll97'] as const;

  calculate(input: FinancialCalculationInput): FinancialCalculationOutput {
    console.log(`[${this.serviceName}] Calculating financial analysis`);

    const config = {
      ...defaultFinancialConfig,
      loanTermYears: input.loanTermYears ?? defaultFinancialConfig.loanTermYears,
      annualInterestRate: input.annualInterestRate ?? defaultFinancialConfig.annualInterestRate,
      analysisStartYear: input.analysisStartYear ?? defaultFinancialConfig.analysisStartYear,
      analysisEndYear: input.analysisEndYear ?? defaultFinancialConfig.analysisEndYear,
      upgradeYear: input.upgradeYear ?? defaultFinancialConfig.upgradeYear,
    };

    // Step 1: Calculate LL97 fee avoidance by period
    const feeAvoidance = this.calculateLL97FeeAvoidance(input);

    // Step 2: Calculate annual savings by year (varying by LL97 periods)
    const { cumulativeSavingsByYear, annualSavingsByYear } = this.calculateCumulativeSavingsByYear(
      input.annualEnergySavings,
      feeAvoidance,
      config
    );

    // Step 3: Calculate simple payback period
    const simplePaybackPeriod = calculateSimplePaybackPeriod(
      input.totalRetrofitCost,
      cumulativeSavingsByYear
    );

    // Step 4: Calculate loan analysis
    const loanAnalysis = this.calculateLoanAnalysis(input.totalRetrofitCost, config);

    // Step 5: Calculate summary metrics
    const summary = this.calculateSummaryMetrics(
      input.totalRetrofitCost,
      cumulativeSavingsByYear,
      annualSavingsByYear,
      config
    );

    // Step 6: Generate visualization data
    const visualization = {
      analysisYears: generateAnalysisYears(config),
      annualSavingsByYear,
      loanBalanceByYear: loanAnalysis.loanBalanceByYear,
      cumulativeSavingsByYear,
    };

    const result: FinancialCalculationOutput = {
      calculationId: input.calculationId,
      lastCalculated: new Date(),
      serviceVersion: this.version,

      // LL97 Fee Avoidance calculations
      ...feeAvoidance,

      // Payback analysis
      simplePaybackPeriod,
      cumulativeSavingsByYear,

      // Loan analysis
      ...loanAnalysis,

      // Summary metrics
      summary,

      // Visualization data
      visualization,

      // Configuration used
      analysisConfig: config,
    };

    console.log(`[${this.serviceName}] Simple payback period: ${simplePaybackPeriod === -1 ? 'Not achieved' : simplePaybackPeriod}`);
    console.log(`[${this.serviceName}] Total 20-year savings: $${summary.totalSavingsOverAnalysisPeriod.toLocaleString()}`);

    return result;
  }

  private calculateLL97FeeAvoidance(input: FinancialCalculationInput) {
    return {
      annualLL97FeeAvoidance2024to2027: input.annualFeeExceedingBudget2024to2029 - input.adjustedAnnualFeeBefore2027,
      annualLL97FeeAvoidance2027to2029: input.annualFeeExceedingBudget2024to2029 - input.adjustedAnnualFee2027to2029,
      annualLL97FeeAvoidance2030to2034: input.annualFeeExceedingBudget2030to2034 - input.adjustedAnnualFee2030to2034,
      annualLL97FeeAvoidance2035to2039: input.annualFeeExceedingBudget2035to2039 - input.adjustedAnnualFee2035to2039,
      annualLL97FeeAvoidance2040to2049: input.annualFeeExceedingBudget2040to2049 - input.adjustedAnnualFee2040to2049,
    };
  }

  private calculateCumulativeSavingsByYear(
    annualEnergySavings: number,
    feeAvoidance: ReturnType<typeof this.calculateLL97FeeAvoidance>,
    config: typeof defaultFinancialConfig
  ) {
    const analysisYears = generateAnalysisYears(config);
    const cumulativeSavingsByYear: number[] = [];
    const annualSavingsByYear: number[] = [];
    let cumulativeSavings = 0;

    for (const year of analysisYears) {
      let annualSavings = 0;

      if (year < config.savingsStartYear) {
        // No savings during upgrade year
        annualSavings = 0;
      } else {
        // Energy savings apply every year
        annualSavings = annualEnergySavings;

        // Add LL97 fee avoidance based on year
        if (year >= 2024 && year <= 2026) {
          annualSavings += feeAvoidance.annualLL97FeeAvoidance2024to2027;
        } else if (year >= 2027 && year <= 2029) {
          annualSavings += feeAvoidance.annualLL97FeeAvoidance2027to2029;
        } else if (year >= 2030 && year <= 2034) {
          annualSavings += feeAvoidance.annualLL97FeeAvoidance2030to2034;
        } else if (year >= 2035 && year <= 2039) {
          annualSavings += feeAvoidance.annualLL97FeeAvoidance2035to2039;
        } else {
          annualSavings += feeAvoidance.annualLL97FeeAvoidance2040to2049;
        }
      }

      cumulativeSavings += annualSavings;
      annualSavingsByYear.push(annualSavings);
      cumulativeSavingsByYear.push(cumulativeSavings);
    }

    return { cumulativeSavingsByYear, annualSavingsByYear };
  }

  private calculateLoanAnalysis(totalRetrofitCost: number, config: typeof defaultFinancialConfig) {
    const monthlyPayment = calculateMonthlyPayment(
      totalRetrofitCost,
      config.annualInterestRate,
      config.loanTermYears
    );

    const loanBalanceByYear = generateLoanBalanceArray(totalRetrofitCost, config);

    const totalInterestPaid = (monthlyPayment * 12 * config.loanTermYears) - totalRetrofitCost;

    return {
      loanBalanceByYear,
      monthlyPayment,
      totalInterestPaid,
    };
  }

  private calculateSummaryMetrics(
    totalRetrofitCost: number,
    cumulativeSavingsByYear: number[],
    annualSavingsByYear: number[],
    config: typeof defaultFinancialConfig
  ) {
    const totalSavingsOverAnalysisPeriod = cumulativeSavingsByYear[cumulativeSavingsByYear.length - 1] || 0;
    const averageAnnualSavings = annualSavingsByYear.reduce((sum, savings) => sum + savings, 0) / annualSavingsByYear.length;

    // Simple NPV calculation (simplified - doesn't account for discount rate)
    const netPresentValue = totalSavingsOverAnalysisPeriod - totalRetrofitCost;

    // Return on investment
    const returnOnInvestment = totalRetrofitCost > 0 ? (netPresentValue / totalRetrofitCost) * 100 : 0;

    return {
      averageAnnualSavings,
      totalSavingsOverAnalysisPeriod,
      netPresentValue,
      returnOnInvestment,
    };
  }

  buildInputFromCalculation(
    calculation: Calculations,
    overrides?: FinancialCalculationOverrides
  ): FinancialCalculationInput {
    const baseInput: FinancialCalculationInput = {
      calculationId: calculation.id,
      totalRetrofitCost: calculation.totalRetrofitCost || 0,
      annualEnergySavings: calculation.annualEnergySavings || 0,

      // LL97 fee data (current fees without upgrade)
      annualFeeExceedingBudget2024to2029: calculation.annualFeeExceedingBudget2024to2029 || 0,
      annualFeeExceedingBudget2030to2034: calculation.annualFeeExceedingBudget2030to2034 || 0,
      annualFeeExceedingBudget2035to2039: calculation.annualFeeExceedingBudget2035to2039 || 0,
      annualFeeExceedingBudget2040to2049: calculation.annualFeeExceedingBudget2040to2049 || 0,

      // LL97 fees with upgrade
      adjustedAnnualFeeBefore2027: calculation.adjustedAnnualFeeBefore2027 || 0,
      adjustedAnnualFee2027to2029: calculation.adjustedAnnualFee2027to2029 || 0,
      adjustedAnnualFee2030to2034: calculation.adjustedAnnualFee2030to2034 || 0,
      adjustedAnnualFee2035to2039: calculation.adjustedAnnualFee2035to2039 || 0,
      adjustedAnnualFee2040to2049: calculation.adjustedAnnualFee2040to2049 || 0,
    };

    return { ...baseInput, ...overrides };
  }

  validateInput(input: FinancialCalculationInput): OverrideValidationResult {
    const result: OverrideValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    if (!input.totalRetrofitCost || input.totalRetrofitCost <= 0) {
      result.errors.push({
        field: 'totalRetrofitCost',
        message: 'Total retrofit cost must be greater than 0',
      });
    }

    if (input.loanTermYears !== undefined && (input.loanTermYears < 1 || input.loanTermYears > 30)) {
      result.warnings.push({
        field: 'loanTermYears',
        message: 'Loan term should typically be between 1 and 30 years',
      });
    }

    if (input.annualInterestRate !== undefined && (input.annualInterestRate < 0 || input.annualInterestRate > 0.2)) {
      result.warnings.push({
        field: 'annualInterestRate',
        message: 'Interest rate should typically be between 0% and 20%',
      });
    }

    result.valid = result.errors.length === 0;
    return result;
  }

  async saveResultsToDatabase(calculationId: string, output: FinancialCalculationOutput): Promise<void> {
    console.log(`[${this.serviceName}] Saving financial results to database for ${calculationId}`);

    await prisma.calculations.update({
      where: { id: calculationId },
      data: {
        // LL97 Fee Avoidance
        annualLL97FeeAvoidance2024to2027: output.annualLL97FeeAvoidance2024to2027,
        annualLL97FeeAvoidance2027to2029: output.annualLL97FeeAvoidance2027to2029,
        annualLL97FeeAvoidance2030to2034: output.annualLL97FeeAvoidance2030to2034,
        annualLL97FeeAvoidance2035to2039: output.annualLL97FeeAvoidance2035to2039,
        annualLL97FeeAvoidance2040to2049: output.annualLL97FeeAvoidance2040to2049,

        // Payback analysis
        simplePaybackPeriod: output.simplePaybackPeriod,
        cumulativeSavingsByYear: output.cumulativeSavingsByYear,

        // Loan analysis
        loanBalanceByYear: output.loanBalanceByYear,
        monthlyPayment: output.monthlyPayment,
        totalInterestPaid: output.totalInterestPaid,
      },
    });

    await this.updateServiceMetadata(calculationId);
    console.log(`[${this.serviceName}] Successfully saved financial results`);
  }
}

export const financialCalculationService = new FinancialCalculationService();