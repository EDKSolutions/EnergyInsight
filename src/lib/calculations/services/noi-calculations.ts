/**
 * NOI (Net Operating Income) Calculations Service - Section 9
 * Enhances existing NOI service with upgrade impact analysis
 * Matches LaTeX document Section 9 exactly
 */

import { getNoiByBbl } from '@/lib/services/noi';
import { UnitBreakdown } from '@/lib/ai/types';

export interface NOIInput {
  // Building identification
  bbl: string;
  unitBreakdown: UnitBreakdown;
  
  // Energy savings from upgrade
  annualEnergySavings: number;
  
  // LL97 fees by period (without upgrade)
  annualFeeExceedingBudget2024to2029: number;
  annualFeeExceedingBudget2030to2034: number;
  annualFeeExceedingBudget2035to2039: number;
  annualFeeExceedingBudget2040to2049: number;
  
  // LL97 fees by period (with upgrade)
  adjustedAnnualFeeBefore2027: number;
  adjustedAnnualFee2027to2029: number;
  adjustedAnnualFee2030to2034: number;
  adjustedAnnualFee2035to2039: number;
  adjustedAnnualFee2040to2049: number;
}

export interface NOIResults {
  // Current NOI (baseline)
  currentNOI: number;
  
  // NOI scenarios without upgrade
  noiNoUpgrade2024to2029: number;
  noiNoUpgrade2030to2034: number;
  noiNoUpgrade2035to2039: number;
  noiNoUpgrade2040to2049: number;
  
  // NOI scenarios with upgrade
  noiWithUpgrade2024to2027: number;
  noiWithUpgrade2027to2029: number;
  noiWithUpgrade2030to2034: number;
  noiWithUpgrade2035to2039: number;
  noiWithUpgrade2040to2049: number;
}

export class NOICalculationService {
  /**
   * Calculate complete NOI analysis
   * Implements LaTeX Section 9 NOI calculations
   */
  async calculateNOIAnalysis(input: NOIInput): Promise<NOIResults> {
    console.log('Calculating NOI analysis for upgrade vs no-upgrade scenarios');
    
    // Get current NOI from existing service
    const currentNOI = await getNoiByBbl(input.bbl, input.unitBreakdown);
    
    // Calculate NOI scenarios without upgrade
    const noiWithoutUpgrade = this.calculateNOIWithoutUpgrade(currentNOI, input);
    
    // Calculate NOI scenarios with upgrade
    const noiWithUpgrade = this.calculateNOIWithUpgrade(currentNOI, input);
    
    return {
      currentNOI,
      ...noiWithoutUpgrade,
      ...noiWithUpgrade
    };
  }
  
  /**
   * Section 9.1 - NOI Without Upgrade (Status Quo)
   * NOI decreases due to LL97 penalties
   */
  private calculateNOIWithoutUpgrade(
    currentNOI: number, 
    input: NOIInput
  ) {
    // Scenario A: No Upgrade - NOI decreases due to LL97 penalties
    const noiNoUpgrade2024to2029 = this.roundTo2Decimals(
      currentNOI - input.annualFeeExceedingBudget2024to2029
    );
    
    const noiNoUpgrade2030to2034 = this.roundTo2Decimals(
      currentNOI - input.annualFeeExceedingBudget2030to2034
    );
    
    const noiNoUpgrade2035to2039 = this.roundTo2Decimals(
      currentNOI - input.annualFeeExceedingBudget2035to2039
    );
    
    const noiNoUpgrade2040to2049 = this.roundTo2Decimals(
      currentNOI - input.annualFeeExceedingBudget2040to2049
    );
    
    return {
      noiNoUpgrade2024to2029,
      noiNoUpgrade2030to2034,
      noiNoUpgrade2035to2039,
      noiNoUpgrade2040to2049
    };
  }
  
  /**
   * Section 9.2 - NOI With Upgrade
   * NOI increases due to energy savings and reduced LL97 penalties
   */
  private calculateNOIWithUpgrade(
    currentNOI: number, 
    input: NOIInput
  ) {
    // Scenario B: With PTHP Upgrade - NOI increases from energy savings and reduced penalties
    const noiWithUpgrade2024to2027 = this.roundTo2Decimals(
      currentNOI + input.annualEnergySavings - input.adjustedAnnualFeeBefore2027
    );
    
    const noiWithUpgrade2027to2029 = this.roundTo2Decimals(
      currentNOI + input.annualEnergySavings - input.adjustedAnnualFee2027to2029
    );
    
    const noiWithUpgrade2030to2034 = this.roundTo2Decimals(
      currentNOI + input.annualEnergySavings - input.adjustedAnnualFee2030to2034
    );
    
    const noiWithUpgrade2035to2039 = this.roundTo2Decimals(
      currentNOI + input.annualEnergySavings - input.adjustedAnnualFee2035to2039
    );
    
    const noiWithUpgrade2040to2049 = this.roundTo2Decimals(
      currentNOI + input.annualEnergySavings - input.adjustedAnnualFee2040to2049
    );
    
    return {
      noiWithUpgrade2024to2027,
      noiWithUpgrade2027to2029,
      noiWithUpgrade2030to2034,
      noiWithUpgrade2035to2039,
      noiWithUpgrade2040to2049
    };
  }
  
  /**
   * Calculate NOI gap analysis
   * Shows the sustained benefit of upgrading across all periods
   */
  calculateNOIGapAnalysis(results: NOIResults): {
    noiGap2024to2029: number;
    noiGap2030to2034: number;
    noiGap2035to2039: number;
    noiGap2040to2049: number;
    sustainedBenefit: number; // Long-term annual benefit
  } {
    const noiGap2024to2029 = this.roundTo2Decimals(
      results.noiWithUpgrade2024to2027 - results.noiNoUpgrade2024to2029
    );
    
    const noiGap2030to2034 = this.roundTo2Decimals(
      results.noiWithUpgrade2030to2034 - results.noiNoUpgrade2030to2034
    );
    
    const noiGap2035to2039 = this.roundTo2Decimals(
      results.noiWithUpgrade2035to2039 - results.noiNoUpgrade2035to2039
    );
    
    const noiGap2040to2049 = this.roundTo2Decimals(
      results.noiWithUpgrade2040to2049 - results.noiNoUpgrade2040to2049
    );
    
    // Sustained benefit represents the ongoing annual NOI advantage
    const sustainedBenefit = noiGap2040to2049; // Long-term steady state
    
    return {
      noiGap2024to2029,
      noiGap2030to2034,
      noiGap2035to2039,
      noiGap2040to2049,
      sustainedBenefit
    };
  }
  
  /**
   * Generate NOI visualization data
   * Matches the LaTeX NOI chart data structure
   */
  generateNOIVisualizationData(results: NOIResults): {
    years: number[];
    noiWithUpgrade: number[];
    noiWithoutUpgrade: number[];
    significantEvents: Array<{year: number; event: string}>;
  } {
    // Sample years for visualization (can be made configurable)
    const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040];
    
    const noiWithUpgrade = years.map(year => {
      if (year >= 2024 && year <= 2025) {
        return results.currentNOI; // No changes yet
      } else if (year >= 2026 && year <= 2026) {
        return results.noiWithUpgrade2024to2027;
      } else if (year >= 2027 && year <= 2029) {
        return results.noiWithUpgrade2027to2029;
      } else if (year >= 2030 && year <= 2034) {
        return results.noiWithUpgrade2030to2034;
      } else if (year >= 2035 && year <= 2039) {
        return results.noiWithUpgrade2035to2039;
      } else {
        return results.noiWithUpgrade2040to2049;
      }
    });
    
    const noiWithoutUpgrade = years.map(year => {
      if (year >= 2024 && year <= 2025) {
        return results.currentNOI; // No penalties yet
      } else if (year >= 2026 && year <= 2029) {
        return results.noiNoUpgrade2024to2029;
      } else if (year >= 2030 && year <= 2034) {
        return results.noiNoUpgrade2030to2034;
      } else if (year >= 2035 && year <= 2039) {
        return results.noiNoUpgrade2035to2039;
      } else {
        return results.noiNoUpgrade2040to2049;
      }
    });
    
    const significantEvents = [
      { year: 2025, event: 'Upgrade Completed' },
      { year: 2026, event: 'Fees/Savings Begin' },
      { year: 2027, event: 'Reduced BE Credit' },
      { year: 2030, event: 'Higher LL97 Penalties' },
      { year: 2035, event: 'Continued LL97' }
    ];
    
    return {
      years,
      noiWithUpgrade,
      noiWithoutUpgrade,
      significantEvents
    };
  }
  
  /**
   * Calculate NOI impact summary
   */
  calculateNOIImpactSummary(results: NOIResults): {
    immediateNOIBoost: number;
    immediateNOIBoostPercentage: number;
    longTermNOIAdvantage: number;
    riskMitigation: number; // How much penalty risk is avoided
  } {
    const gapAnalysis = this.calculateNOIGapAnalysis(results);
    
    const immediateNOIBoost = results.noiWithUpgrade2024to2027 - results.currentNOI;
    const immediateNOIBoostPercentage = (immediateNOIBoost / results.currentNOI) * 100;
    const longTermNOIAdvantage = gapAnalysis.sustainedBenefit;
    const riskMitigation = results.currentNOI - results.noiNoUpgrade2030to2034; // Penalty avoidance
    
    return {
      immediateNOIBoost: this.roundTo2Decimals(immediateNOIBoost),
      immediateNOIBoostPercentage: this.roundTo2Decimals(immediateNOIBoostPercentage),
      longTermNOIAdvantage: this.roundTo2Decimals(longTermNOIAdvantage),
      riskMitigation: this.roundTo2Decimals(riskMitigation)
    };
  }
  
  /**
   * Function implementations for unified NOI calculations
   * Matches LaTeX Section 9.3 function implementations
   */
  async calculateAdjustedNOINoUpgrade(year: number, input: NOIInput): Promise<number> {
    const currentNOI = await getNoiByBbl(input.bbl, input.unitBreakdown);
    
    if (year >= 2024 && year <= 2029) {
      return currentNOI - input.annualFeeExceedingBudget2024to2029;
    } else if (year >= 2030 && year <= 2034) {
      return currentNOI - input.annualFeeExceedingBudget2030to2034;
    } else if (year >= 2035 && year <= 2039) {
      return currentNOI - input.annualFeeExceedingBudget2035to2039;
    } else {
      return currentNOI - input.annualFeeExceedingBudget2040to2049;
    }
  }
  
  async calculateAdjustedNOIUpgrade(year: number, input: NOIInput): Promise<number> {
    const currentNOI = await getNoiByBbl(input.bbl, input.unitBreakdown);
    
    let reducedLL97Penalties = 0;
    if (year >= 2024 && year <= 2026) {
      reducedLL97Penalties = input.adjustedAnnualFeeBefore2027;
    } else if (year >= 2027 && year <= 2029) {
      reducedLL97Penalties = input.adjustedAnnualFee2027to2029;
    } else if (year >= 2030 && year <= 2034) {
      reducedLL97Penalties = input.adjustedAnnualFee2030to2034;
    } else if (year >= 2035 && year <= 2039) {
      reducedLL97Penalties = input.adjustedAnnualFee2035to2039;
    } else {
      reducedLL97Penalties = input.adjustedAnnualFee2040to2049;
    }
    
    return currentNOI + input.annualEnergySavings - reducedLL97Penalties;
  }
  
  /**
   * Utility function to round to 2 decimal places
   */
  private roundTo2Decimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

// Export singleton instance
export const noiCalculationService = new NOICalculationService();