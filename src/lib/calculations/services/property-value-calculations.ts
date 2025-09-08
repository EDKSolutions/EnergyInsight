/**
 * Property Value Calculations Service - Section 10
 * Implements property value analysis based on NOI and cap rates
 * Matches LaTeX document Section 10 exactly
 */

import { 
  defaultCapRate, 
  alternativeCapRates, 
  calculatePropertyValue, 
  calculateNetPropertyValueGain 
} from '../constants/financial-constants';
import { NOIResults } from './noi-calculations';

export interface PropertyValueInput {
  // NOI results from previous calculation
  noiResults: NOIResults;
  
  // Cap rate configuration (optional)
  capRate?: number;
}

export interface PropertyValueResults {
  // Property values without upgrade
  propertyValueNoUpgrade: number;
  
  // Property values with upgrade by period
  propertyValueWithUpgrade2024to2027: number;
  propertyValueWithUpgrade2027to2029: number;
  propertyValueWithUpgrade2030to2034: number;
  propertyValueWithUpgrade2035to2039: number;
  propertyValueWithUpgrade2040to2049: number;
  
  // Net property value gains
  netPropertyValueGain: number;
  
  // Configuration used
  capRateUsed: number;
}

export class PropertyValueCalculationService {
  /**
   * Calculate complete property value analysis
   * Implements LaTeX Section 10 property value calculations
   */
  calculatePropertyValueAnalysis(input: PropertyValueInput): PropertyValueResults {
    console.log('Calculating property value analysis');
    
    const capRate = input.capRate || defaultCapRate;
    
    // Calculate property values without upgrade (uses worst-case NOI)
    const propertyValueNoUpgrade = this.calculatePropertyValueNoUpgrade(
      input.noiResults, 
      capRate
    );
    
    // Calculate property values with upgrade for each period
    const propertyValuesWithUpgrade = this.calculatePropertyValuesWithUpgrade(
      input.noiResults, 
      capRate
    );
    
    // Calculate net property value gain (long-term sustainable benefit)
    const netPropertyValueGain = this.calculateNetPropertyValueGain(
      input.noiResults, 
      capRate
    );
    
    return {
      propertyValueNoUpgrade,
      ...propertyValuesWithUpgrade,
      netPropertyValueGain,
      capRateUsed: capRate
    };
  }
  
  /**
   * Section 10.1 - Property Value Without Upgrade
   * Uses the worst-case NOI scenario (post-2035 with highest penalties)
   */
  private calculatePropertyValueNoUpgrade(
    noiResults: NOIResults, 
    capRate: number
  ): number {
    // Use the lowest NOI scenario (post-2035) for conservative valuation
    const worstCaseNOI = Math.min(
      noiResults.noiNoUpgrade2030to2034,
      noiResults.noiNoUpgrade2035to2039,
      noiResults.noiNoUpgrade2040to2049
    );
    
    return this.roundTo2Decimals(calculatePropertyValue(worstCaseNOI, capRate));
  }
  
  /**
   * Section 10.2 - Property Values With Upgrade
   * Calculate property values for each NOI scenario
   */
  private calculatePropertyValuesWithUpgrade(
    noiResults: NOIResults, 
    capRate: number
  ) {
    const propertyValueWithUpgrade2024to2027 = this.roundTo2Decimals(
      calculatePropertyValue(noiResults.noiWithUpgrade2024to2027, capRate)
    );
    
    const propertyValueWithUpgrade2027to2029 = this.roundTo2Decimals(
      calculatePropertyValue(noiResults.noiWithUpgrade2027to2029, capRate)
    );
    
    const propertyValueWithUpgrade2030to2034 = this.roundTo2Decimals(
      calculatePropertyValue(noiResults.noiWithUpgrade2030to2034, capRate)
    );
    
    const propertyValueWithUpgrade2035to2039 = this.roundTo2Decimals(
      calculatePropertyValue(noiResults.noiWithUpgrade2035to2039, capRate)
    );
    
    const propertyValueWithUpgrade2040to2049 = this.roundTo2Decimals(
      calculatePropertyValue(noiResults.noiWithUpgrade2040to2049, capRate)
    );
    
    return {
      propertyValueWithUpgrade2024to2027,
      propertyValueWithUpgrade2027to2029,
      propertyValueWithUpgrade2030to2034,
      propertyValueWithUpgrade2035to2039,
      propertyValueWithUpgrade2040to2049
    };
  }
  
  /**
   * Section 10.3 - Net Property Value Gain
   * Calculate the sustained property value advantage from upgrading
   */
  private calculateNetPropertyValueGain(
    noiResults: NOIResults, 
    capRate: number
  ): number {
    // Use long-term sustainable NOI benefit (post-2035)
    const longTermNOIWithUpgrade = noiResults.noiWithUpgrade2040to2049;
    const longTermNOIWithoutUpgrade = noiResults.noiNoUpgrade2040to2049;
    
    return this.roundTo2Decimals(
      calculateNetPropertyValueGain(longTermNOIWithUpgrade, longTermNOIWithoutUpgrade, capRate)
    );
  }
  
  /**
   * Calculate property value sensitivity analysis
   * Shows how property values change with different cap rates
   */
  calculateCapRateSensitivityAnalysis(
    noiResults: NOIResults
  ): Array<{
    capRate: number;
    propertyValueWithUpgrade: number;
    propertyValueWithoutUpgrade: number;
    netGain: number;
  }> {
    return alternativeCapRates.map(capRate => {
      const propertyValueWithUpgrade = calculatePropertyValue(
        noiResults.noiWithUpgrade2040to2049, 
        capRate
      );
      
      const propertyValueWithoutUpgrade = calculatePropertyValue(
        noiResults.noiNoUpgrade2040to2049, 
        capRate
      );
      
      const netGain = propertyValueWithUpgrade - propertyValueWithoutUpgrade;
      
      return {
        capRate: this.roundTo4Decimals(capRate),
        propertyValueWithUpgrade: this.roundTo2Decimals(propertyValueWithUpgrade),
        propertyValueWithoutUpgrade: this.roundTo2Decimals(propertyValueWithoutUpgrade),
        netGain: this.roundTo2Decimals(netGain)
      };
    });
  }
  
  /**
   * Generate property value visualization data
   * Matches the LaTeX property value chart structure
   */
  generatePropertyValueVisualizationData(
    results: PropertyValueResults,
    noiResults: NOIResults
  ): {
    years: number[];
    propertyValueWithUpgrade: number[];
    propertyValueWithoutUpgrade: number[];
    significantEvents: Array<{year: number; event: string; value: number}>;
  } {
    const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040];
    const capRate = results.capRateUsed;
    
    // Current baseline property value
    const baselineValue = calculatePropertyValue(noiResults.currentNOI, capRate);
    
    const propertyValueWithUpgrade = years.map(year => {
      if (year >= 2024 && year <= 2025) {
        return baselineValue; // No changes yet
      } else if (year >= 2026 && year <= 2026) {
        return results.propertyValueWithUpgrade2024to2027;
      } else if (year >= 2027 && year <= 2029) {
        return results.propertyValueWithUpgrade2027to2029;
      } else if (year >= 2030 && year <= 2034) {
        return results.propertyValueWithUpgrade2030to2034;
      } else if (year >= 2035 && year <= 2039) {
        return results.propertyValueWithUpgrade2035to2039;
      } else {
        return results.propertyValueWithUpgrade2040to2049;
      }
    });
    
    const propertyValueWithoutUpgrade = years.map(year => {
      if (year >= 2024 && year <= 2025) {
        return baselineValue; // No penalties yet
      } else if (year >= 2026 && year <= 2029) {
        return calculatePropertyValue(noiResults.noiNoUpgrade2024to2029, capRate);
      } else if (year >= 2030 && year <= 2034) {
        return calculatePropertyValue(noiResults.noiNoUpgrade2030to2034, capRate);
      } else if (year >= 2035 && year <= 2039) {
        return calculatePropertyValue(noiResults.noiNoUpgrade2035to2039, capRate);
      } else {
        return results.propertyValueNoUpgrade;
      }
    });
    
    const significantEvents = [
      { year: 2025, event: 'Upgrade Completed', value: baselineValue },
      { year: 2026, event: 'Value Impact Begins', value: results.propertyValueWithUpgrade2024to2027 },
      { year: 2030, event: 'Higher Penalties Impact', value: results.propertyValueWithUpgrade2030to2034 },
      { year: 2035, event: 'Long-term Benefit', value: results.propertyValueWithUpgrade2035to2039 }
    ];
    
    return {
      years,
      propertyValueWithUpgrade: propertyValueWithUpgrade.map(v => this.roundTo2Decimals(v)),
      propertyValueWithoutUpgrade: propertyValueWithoutUpgrade.map(v => this.roundTo2Decimals(v)),
      significantEvents
    };
  }
  
  /**
   * Calculate property value impact summary
   */
  calculatePropertyValueImpactSummary(
    results: PropertyValueResults,
    totalRetrofitCost: number
  ): {
    valueToInvestmentRatio: number;
    returnOnInvestment: number;
    propertyValuePreservation: number;
    longTermAppreciation: number;
  } {
    const valueToInvestmentRatio = results.netPropertyValueGain / totalRetrofitCost;
    const returnOnInvestment = ((results.netPropertyValueGain - totalRetrofitCost) / totalRetrofitCost) * 100;
    
    // Current value vs. worst-case without upgrade
    const currentValue = calculatePropertyValue(
      // Estimate current value from best-case NOI
      Math.max(...Object.values(results).filter(v => typeof v === 'number' && v < 100000000)),
      results.capRateUsed
    );
    
    const propertyValuePreservation = results.netPropertyValueGain;
    const longTermAppreciation = results.propertyValueWithUpgrade2040to2049 - currentValue;
    
    return {
      valueToInvestmentRatio: this.roundTo2Decimals(valueToInvestmentRatio),
      returnOnInvestment: this.roundTo2Decimals(returnOnInvestment),
      propertyValuePreservation: this.roundTo2Decimals(propertyValuePreservation),
      longTermAppreciation: this.roundTo2Decimals(longTermAppreciation)
    };
  }
  
  /**
   * Calculate property value by scenario
   * Helper method for different NOI scenarios
   */
  calculatePropertyValueByScenario(
    noiValue: number, 
    capRate: number = defaultCapRate
  ): number {
    return this.roundTo2Decimals(calculatePropertyValue(noiValue, capRate));
  }
  
  /**
   * Utility function to round to 2 decimal places
   */
  private roundTo2Decimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
  
  /**
   * Utility function to round to 4 decimal places (for cap rates)
   */
  private roundTo4Decimals(value: number): number {
    return Math.round(value * 10000) / 10000;
  }
}

// Export singleton instance
export const propertyValueCalculationService = new PropertyValueCalculationService();