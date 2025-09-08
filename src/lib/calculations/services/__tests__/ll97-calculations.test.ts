/**
 * LL97 Calculations Service Tests
 * Tests all LL97 calculation functions against LaTeX document examples
 */

import { ll97CalculationService, LL97Input } from '../ll97-calculations';

describe('LL97CalculationService', () => {
  // Test data matching LaTeX document examples
  const testInput: LL97Input = {
    buildingClass: 'R6',
    totalSquareFeet: 100000, // 100,000 sq ft building
    totalBuildingEmissionsLL84: 1250.50, // Current emissions
    annualBuildingMMBtuHeatingPTAC: 2550.00, // PTAC heating MMBtu
    annualBuildingkWhHeatingPTHP: 35000.00 // PTHP heating kWh (with EFLH)
  };

  describe('calculateLL97Analysis', () => {
    it('should calculate complete LL97 analysis', () => {
      const result = ll97CalculationService.calculateLL97Analysis(testInput);
      
      // Should return all required fields
      expect(result).toHaveProperty('emissionsBudget2024to2029');
      expect(result).toHaveProperty('emissionsBudget2030to2034');
      expect(result).toHaveProperty('emissionsBudget2035to2039');
      expect(result).toHaveProperty('emissionsBudget2040to2049');
      expect(result).toHaveProperty('beCreditBefore2027');
      expect(result).toHaveProperty('beCredit2027to2029');
      expect(result).toHaveProperty('adjustedTotalBuildingEmissions2024to2029');
      expect(result).toHaveProperty('adjustedTotalBuildingEmissions2030to2034');
      
      // All values should be numbers
      Object.values(result).forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Emissions Budget Calculations', () => {
    it('should calculate emissions budgets correctly for multifamily building', () => {
      const result = ll97CalculationService.calculateLL97Analysis(testInput);
      
      // For multifamily (R6), 100,000 sq ft:
      // 2024-2029: 100,000 × 0.00892 = 892 tCO2e
      expect(result.emissionsBudget2024to2029).toBeCloseTo(892, 2);
      
      // 2030-2034: 100,000 × 0.00453 = 453 tCO2e  
      expect(result.emissionsBudget2030to2034).toBeCloseTo(453, 2);
      
      // 2035-2039: 100,000 × 0.00165234 = 165.234 tCO2e
      expect(result.emissionsBudget2035to2039).toBeCloseTo(165.23, 2);
      
      // 2040-2049: 100,000 × 0.000581893 = 58.19 tCO2e
      expect(result.emissionsBudget2040to2049).toBeCloseTo(58.19, 2);
    });

    it('should handle different building classes correctly', () => {
      const officeInput = { ...testInput, buildingClass: 'O4' };
      const result = ll97CalculationService.calculateLL97Analysis(officeInput);
      
      // Office buildings should use office emissions limits
      // 2024-2029: 100,000 × 0.00846 = 846 tCO2e (different from multifamily)
      expect(result.emissionsBudget2024to2029).toBeCloseTo(846, 2);
    });
  });

  describe('Current Fee Calculations', () => {
    it('should calculate current fees correctly', () => {
      const result = ll97CalculationService.calculateLL97Analysis(testInput);
      
      // Fee = (emissions - budget) × $268/ton
      // 2024-2029: (1250.50 - 892) × 268 = 95,988
      const expectedFee2024to2029 = (1250.50 - 892) * 268;
      expect(result.annualFeeExceedingBudget2024to2029).toBeCloseTo(expectedFee2024to2029, 2);
      
      // 2030-2034: (1250.50 - 453) × 268 = 213,686
      const expectedFee2030to2034 = (1250.50 - 453) * 268;
      expect(result.annualFeeExceedingBudget2030to2034).toBeCloseTo(expectedFee2030to2034, 2);
    });

    it('should return 0 fee when under emissions budget', () => {
      const lowEmissionsInput = { ...testInput, totalBuildingEmissionsLL84: 500 };
      const result = ll97CalculationService.calculateLL97Analysis(lowEmissionsInput);
      
      // Should be 0 since emissions are below budget
      expect(result.annualFeeExceedingBudget2024to2029).toBe(0);
    });
  });

  describe('BE Credit Calculations', () => {
    it('should calculate BE credits correctly', () => {
      const result = ll97CalculationService.calculateLL97Analysis(testInput);
      
      // Before 2027: 35,000 kWh × 0.0013 = 45.5 tCO2e
      expect(result.beCreditBefore2027).toBeCloseTo(45.5, 2);
      
      // 2027-2029: 35,000 kWh × 0.00065 = 22.75 tCO2e
      expect(result.beCredit2027to2029).toBeCloseTo(22.75, 2);
    });

    it('should scale BE credits with heating kWh', () => {
      const doubleHeatingInput = { ...testInput, annualBuildingkWhHeatingPTHP: 70000 };
      const result = ll97CalculationService.calculateLL97Analysis(doubleHeatingInput);
      
      // Should be double the credits
      expect(result.beCreditBefore2027).toBeCloseTo(91, 2);
      expect(result.beCredit2027to2029).toBeCloseTo(45.5, 2);
    });
  });

  describe('Adjusted Emissions Calculations', () => {
    it('should calculate adjusted emissions correctly', () => {
      const result = ll97CalculationService.calculateLL97Analysis(testInput);
      
      // Adjusted = baseline - (gas MMBtu × 0.05311) + (electric kWh × grid factor)
      // 2024-2029: 1250.50 - (2550 × 0.05311) + (35000 × 0.000288962)
      const expectedAdjusted2024to2029 = 1250.50 - (2550 * 0.05311) + (35000 * 0.000288962);
      expect(result.adjustedTotalBuildingEmissions2024to2029).toBeCloseTo(expectedAdjusted2024to2029, 2);
      
      // 2030-2034: Different grid factor
      const expectedAdjusted2030to2034 = 1250.50 - (2550 * 0.05311) + (35000 * 0.000145);
      expect(result.adjustedTotalBuildingEmissions2030to2034).toBeCloseTo(expectedAdjusted2030to2034, 2);
    });

    it('should show emissions reduction from electrification', () => {
      const result = ll97CalculationService.calculateLL97Analysis(testInput);
      
      // Adjusted emissions should be lower than baseline due to cleaner electricity
      expect(result.adjustedTotalBuildingEmissions2024to2029).toBeLessThan(testInput.totalBuildingEmissionsLL84);
      expect(result.adjustedTotalBuildingEmissions2030to2034).toBeLessThan(testInput.totalBuildingEmissionsLL84);
    });
  });

  describe('Adjusted Fee Calculations', () => {
    it('should calculate adjusted fees with BE credits', () => {
      const result = ll97CalculationService.calculateLL97Analysis(testInput);
      
      // Fees should be lower than current fees due to:
      // 1. Lower adjusted emissions
      // 2. BE credit deduction
      expect(result.adjustedAnnualFeeBefore2027).toBeLessThan(result.annualFeeExceedingBudget2024to2029);
      expect(result.adjustedAnnualFee2030to2034).toBeLessThan(result.annualFeeExceedingBudget2030to2034);
    });

    it('should apply higher BE credit before 2027', () => {
      const result = ll97CalculationService.calculateLL97Analysis(testInput);
      
      // Fee before 2027 should be lower than 2027-2029 due to higher BE credit
      expect(result.adjustedAnnualFeeBefore2027).toBeLessThan(result.adjustedAnnualFee2027to2029);
    });

    it('should not go below zero fees', () => {
      // Test with very high BE credits
      const highHeatingInput = { ...testInput, annualBuildingkWhHeatingPTHP: 1000000 };
      const result = ll97CalculationService.calculateLL97Analysis(highHeatingInput);
      
      // All fees should be >= 0
      expect(result.adjustedAnnualFeeBefore2027).toBeGreaterThanOrEqual(0);
      expect(result.adjustedAnnualFee2027to2029).toBeGreaterThanOrEqual(0);
      expect(result.adjustedAnnualFee2030to2034).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Helper Functions', () => {
    it('should get correct emissions limit for year', () => {
      const limit2025 = ll97CalculationService.getEmissionsLimitForYear('R6', 2025);
      const limit2031 = ll97CalculationService.getEmissionsLimitForYear('R6', 2031);
      const limit2036 = ll97CalculationService.getEmissionsLimitForYear('R6', 2036);
      
      // Should return correct limits for different periods
      expect(limit2025).toBe(0.00892); // 2024-2029 period
      expect(limit2031).toBe(0.00453); // 2030-2034 period  
      expect(limit2036).toBe(0.00165234); // 2035-2039 period
    });

    it('should get correct BE credit for year', () => {
      const credit2025 = ll97CalculationService.getBECreditForYear(2025, 10000);
      const credit2028 = ll97CalculationService.getBECreditForYear(2028, 10000);
      const credit2031 = ll97CalculationService.getBECreditForYear(2031, 10000);
      
      // Should apply correct coefficients
      expect(credit2025).toBeCloseTo(13, 2); // 10000 × 0.0013
      expect(credit2028).toBeCloseTo(6.5, 2); // 10000 × 0.00065
      expect(credit2031).toBe(0); // No credit after 2029
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero values gracefully', () => {
      const zeroInput = {
        buildingClass: 'R6',
        totalSquareFeet: 0,
        totalBuildingEmissionsLL84: 0,
        annualBuildingMMBtuHeatingPTAC: 0,
        annualBuildingkWhHeatingPTHP: 0
      };
      
      const result = ll97CalculationService.calculateLL97Analysis(zeroInput);
      
      // Should return valid results with 0s
      expect(result.emissionsBudget2024to2029).toBe(0);
      expect(result.beCreditBefore2027).toBe(0);
      expect(result.annualFeeExceedingBudget2024to2029).toBe(0);
    });

    it('should handle unknown building classes', () => {
      const unknownClassInput = { ...testInput, buildingClass: 'UNKNOWN' };
      const result = ll97CalculationService.calculateLL97Analysis(unknownClassInput);
      
      // Should default to multifamily limits
      expect(result.emissionsBudget2024to2029).toBeCloseTo(892, 2);
    });

    it('should round results to 2 decimal places', () => {
      const result = ll97CalculationService.calculateLL97Analysis(testInput);
      
      // All results should have at most 2 decimal places
      Object.values(result).forEach(value => {
        const decimalPlaces = (value.toString().split('.')[1] || '').length;
        expect(decimalPlaces).toBeLessThanOrEqual(2);
      });
    });
  });
});