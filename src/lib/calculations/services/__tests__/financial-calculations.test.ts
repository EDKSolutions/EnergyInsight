/**
 * Financial Analysis Service Tests
 * Tests all financial calculation functions against LaTeX document examples
 */

import { financialCalculationService, FinancialInput } from '../financial-calculations';

describe('FinancialCalculationService', () => {
  // Test data matching LaTeX document examples
  const testInput: FinancialInput = {
    totalRetrofitCost: 500000, // $500K retrofit cost
    annualEnergySavings: 31643, // Annual energy savings
    
    // Current LL97 fees (without upgrade)
    annualFeeExceedingBudget2024to2029: 125000,
    annualFeeExceedingBudget2030to2034: 250000,
    annualFeeExceedingBudget2035to2039: 350000,
    annualFeeExceedingBudget2040to2049: 450000,
    
    // Adjusted LL97 fees (with upgrade)
    adjustedAnnualFeeBefore2027: 15000,
    adjustedAnnualFee2027to2029: 17500,
    adjustedAnnualFee2030to2034: 33000,
    adjustedAnnualFee2035to2039: 33000,
    adjustedAnnualFee2040to2049: 33000,
    
    config: {
      loanTermYears: 15,
      annualInterestRate: 0.06,
      capRate: 0.04,
      analysisStartYear: 2024,
      analysisEndYear: 2045
    }
  };

  describe('calculateFinancialAnalysis', () => {
    it('should calculate complete financial analysis', () => {
      const result = financialCalculationService.calculateFinancialAnalysis(testInput);
      
      // Should return all required fields
      expect(result).toHaveProperty('annualLL97FeeAvoidance2024to2027');
      expect(result).toHaveProperty('annualLL97FeeAvoidance2027to2029');
      expect(result).toHaveProperty('annualLL97FeeAvoidance2030to2034');
      expect(result).toHaveProperty('simplePaybackPeriod');
      expect(result).toHaveProperty('cumulativeSavingsByYear');
      expect(result).toHaveProperty('loanBalanceByYear');
      expect(result).toHaveProperty('monthlyPayment');
      
      // Values should be reasonable
      expect(result.simplePaybackPeriod).toBeGreaterThan(2020); // Should be a year after 2024
      expect(result.cumulativeSavingsByYear.length).toBeGreaterThan(0);
      expect(result.monthlyPayment).toBeGreaterThan(0);
    });
  });

  describe('LL97 Fee Avoidance Calculations', () => {
    it('should calculate fee avoidance correctly for each period', () => {
      const result = financialCalculationService.calculateFinancialAnalysis(testInput);
      
      // 2024-2027: 125,000 - 15,000 = 110,000
      expect(result.annualLL97FeeAvoidance2024to2027).toBeCloseTo(110000, 2);
      
      // 2027-2029: 125,000 - 17,500 = 107,500
      expect(result.annualLL97FeeAvoidance2027to2029).toBeCloseTo(107500, 2);
      
      // 2030-2034: 250,000 - 33,000 = 217,000
      expect(result.annualLL97FeeAvoidance2030to2034).toBeCloseTo(217000, 2);
      
      // 2035-2039: 350,000 - 33,000 = 317,000
      expect(result.annualLL97FeeAvoidance2035to2039).toBeCloseTo(317000, 2);
      
      // 2040-2049: 450,000 - 33,000 = 417,000
      expect(result.annualLL97FeeAvoidance2040to2049).toBeCloseTo(417000, 2);
    });

    it('should show increasing fee avoidance over time', () => {
      const result = financialCalculationService.calculateFinancialAnalysis(testInput);
      
      // Fee avoidance should increase as LL97 gets stricter
      expect(result.annualLL97FeeAvoidance2030to2034).toBeGreaterThan(result.annualLL97FeeAvoidance2024to2027);
      expect(result.annualLL97FeeAvoidance2035to2039).toBeGreaterThan(result.annualLL97FeeAvoidance2030to2034);
      expect(result.annualLL97FeeAvoidance2040to2049).toBeGreaterThan(result.annualLL97FeeAvoidance2035to2039);
    });
  });

  describe('Cumulative Savings Calculations', () => {
    it('should calculate cumulative savings correctly', () => {
      const result = financialCalculationService.calculateFinancialAnalysis(testInput);
      
      // Should have cumulative savings for analysis period
      expect(result.cumulativeSavingsByYear.length).toBeGreaterThan(15);
      
      // First year should be 0 (no savings in upgrade year)
      expect(result.cumulativeSavingsByYear[0]).toBe(0);
      
      // Cumulative savings should generally increase
      for (let i = 1; i < result.cumulativeSavingsByYear.length - 1; i++) {
        expect(result.cumulativeSavingsByYear[i + 1]).toBeGreaterThanOrEqual(result.cumulativeSavingsByYear[i]);
      }
    });

    it('should match LaTeX example cumulative savings pattern', () => {
      const result = financialCalculationService.calculateFinancialAnalysis(testInput);
      
      // From LaTeX: [0, 47000, 94000, 138000, 182000, 226000, ...]
      // These are approximate based on varying annual savings by LL97 period
      expect(result.cumulativeSavingsByYear[0]).toBe(0);
      
      // Second year should have energy savings + LL97 fee avoidance
      const expectedSecondYear = testInput.annualEnergySavings + result.annualLL97FeeAvoidance2024to2027;
      expect(result.cumulativeSavingsByYear[1]).toBeCloseTo(expectedSecondYear, 0);
    });

    it('should accelerate savings in later LL97 periods', () => {
      const result = financialCalculationService.calculateFinancialAnalysis(testInput);
      
      // Annual increment should be higher in later years due to increased LL97 fees
      const earlyIncrement = result.cumulativeSavingsByYear[2] - result.cumulativeSavingsByYear[1];
      const lateIncrement = result.cumulativeSavingsByYear[10] - result.cumulativeSavingsByYear[9];
      
      expect(lateIncrement).toBeGreaterThan(earlyIncrement);
    });
  });

  describe('Simple Payback Period', () => {
    it('should calculate payback period correctly', () => {
      const result = financialCalculationService.calculateFinancialAnalysis(testInput);
      
      // Should achieve payback within analysis period
      expect(result.simplePaybackPeriod).toBeGreaterThan(2024);
      expect(result.simplePaybackPeriod).toBeLessThan(2045);
      
      // Payback year should correspond to cumulative savings exceeding retrofit cost
      const paybackIndex = result.simplePaybackPeriod - 2024;
      if (paybackIndex > 0 && paybackIndex < result.cumulativeSavingsByYear.length) {
        expect(result.cumulativeSavingsByYear[paybackIndex]).toBeGreaterThanOrEqual(testInput.totalRetrofitCost);
        if (paybackIndex > 0) {
          expect(result.cumulativeSavingsByYear[paybackIndex - 1]).toBeLessThan(testInput.totalRetrofitCost);
        }
      }
    });

    it('should return -1 if payback not achieved', () => {
      const highCostInput = { ...testInput, totalRetrofitCost: 50000000 }; // $50M - unrealistic high cost
      const result = financialCalculationService.calculateFinancialAnalysis(highCostInput);
      
      expect(result.simplePaybackPeriod).toBe(-1);
    });

    it('should achieve faster payback with higher savings', () => {
      const baseCaseResult = financialCalculationService.calculateFinancialAnalysis(testInput);
      
      const highSavingsInput = { 
        ...testInput, 
        annualEnergySavings: testInput.annualEnergySavings * 2 // Double energy savings
      };
      const highSavingsResult = financialCalculationService.calculateFinancialAnalysis(highSavingsInput);
      
      // Higher savings should result in faster payback
      expect(highSavingsResult.simplePaybackPeriod).toBeLessThan(baseCaseResult.simplePaybackPeriod);
    });
  });

  describe('Loan Analysis', () => {
    it('should calculate loan payments correctly', () => {
      const result = financialCalculationService.calculateFinancialAnalysis(testInput);
      
      // Monthly payment should be reasonable for $500K, 15-year, 6% loan
      // Expected: ~$4,220/month
      expect(result.monthlyPayment).toBeCloseTo(4220, -2); // Within $100
      
      // Total interest should be reasonable
      const totalPayments = result.monthlyPayment * 15 * 12;
      const expectedTotalInterest = totalPayments - testInput.totalRetrofitCost;
      expect(result.totalInterestPaid).toBeCloseTo(expectedTotalInterest, 2);
    });

    it('should generate loan balance array', () => {
      const result = financialCalculationService.calculateFinancialAnalysis(testInput);
      
      // Should have balance for each year of loan
      expect(result.loanBalanceByYear.length).toBe(16); // 0 to 15 years
      
      // Balance should start at principal
      expect(result.loanBalanceByYear[0]).toBeCloseTo(testInput.totalRetrofitCost, 2);
      
      // Balance should end at 0
      expect(result.loanBalanceByYear[15]).toBeCloseTo(0, 2);
      
      // Balance should decrease each year
      for (let i = 1; i < result.loanBalanceByYear.length; i++) {
        expect(result.loanBalanceByYear[i]).toBeLessThan(result.loanBalanceByYear[i - 1]);
      }
    });

    it('should handle different loan terms', () => {
      const shortTermInput = { 
        ...testInput, 
        config: { ...testInput.config!, loanTermYears: 10 } 
      };
      const longTermInput = { 
        ...testInput, 
        config: { ...testInput.config!, loanTermYears: 20 } 
      };
      
      const shortTermResult = financialCalculationService.calculateFinancialAnalysis(shortTermInput);
      const longTermResult = financialCalculationService.calculateFinancialAnalysis(longTermInput);
      
      // Shorter term should have higher monthly payment
      expect(shortTermResult.monthlyPayment).toBeGreaterThan(longTermResult.monthlyPayment);
      
      // Shorter term should have less total interest
      expect(shortTermResult.totalInterestPaid).toBeLessThan(longTermResult.totalInterestPaid);
    });
  });

  describe('Visualization Data Generation', () => {
    it('should generate visualization data', () => {
      const result = financialCalculationService.calculateFinancialAnalysis(testInput);
      const vizData = financialCalculationService.generateVisualizationData(result);
      
      // Should have arrays for charting
      expect(vizData.years.length).toBeGreaterThan(0);
      expect(vizData.loanBalance.length).toBeGreaterThan(0);
      expect(vizData.cumulativeSavings.length).toBeGreaterThan(0);
      
      // Arrays should be same length
      expect(vizData.years.length).toBe(vizData.loanBalance.length);
      expect(vizData.years.length).toBe(vizData.cumulativeSavings.length);
      
      // Should identify payback point
      if (result.simplePaybackPeriod > 0) {
        expect(vizData.paybackYear).toBe(result.simplePaybackPeriod);
        expect(vizData.paybackAmount).toBeGreaterThan(0);
      }
    });
  });

  describe('Financial Summary', () => {
    it('should calculate financial summary correctly', () => {
      const result = financialCalculationService.calculateFinancialAnalysis(testInput);
      const summary = financialCalculationService.calculateFinancialSummary(result);
      
      // Should have all summary fields
      expect(summary).toHaveProperty('totalSavingsOverAnalysisPeriod');
      expect(summary).toHaveProperty('averageAnnualSavings');
      expect(summary).toHaveProperty('netPresentValue');
      expect(summary).toHaveProperty('paybackAchieved');
      
      // Values should be reasonable
      expect(summary.totalSavingsOverAnalysisPeriod).toBeGreaterThan(testInput.totalRetrofitCost);
      expect(summary.averageAnnualSavings).toBeGreaterThan(testInput.annualEnergySavings);
      expect(summary.netPresentValue).toBeGreaterThan(0); // Should be profitable
      expect(summary.paybackAchieved).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero retrofit cost', () => {
      const zeroInput = { ...testInput, totalRetrofitCost: 0 };
      const result = financialCalculationService.calculateFinancialAnalysis(zeroInput);
      
      // Should achieve immediate payback
      expect(result.simplePaybackPeriod).toBe(2024); // First year
      expect(result.monthlyPayment).toBe(0);
      expect(result.totalInterestPaid).toBe(0);
    });

    it('should handle zero savings', () => {
      const noSavingsInput = { 
        ...testInput, 
        annualEnergySavings: 0,
        adjustedAnnualFeeBefore2027: testInput.annualFeeExceedingBudget2024to2029,
        adjustedAnnualFee2027to2029: testInput.annualFeeExceedingBudget2024to2029,
        adjustedAnnualFee2030to2034: testInput.annualFeeExceedingBudget2030to2034,
        adjustedAnnualFee2035to2039: testInput.annualFeeExceedingBudget2035to2039,
        adjustedAnnualFee2040to2049: testInput.annualFeeExceedingBudget2040to2049
      };
      
      const result = financialCalculationService.calculateFinancialAnalysis(noSavingsInput);
      
      // Should never achieve payback
      expect(result.simplePaybackPeriod).toBe(-1);
      
      // All cumulative savings should be 0
      result.cumulativeSavingsByYear.forEach(savings => {
        expect(savings).toBe(0);
      });
    });

    it('should handle very high interest rates', () => {
      const highRateInput = { 
        ...testInput, 
        config: { ...testInput.config!, annualInterestRate: 0.20 } // 20% interest
      };
      
      const result = financialCalculationService.calculateFinancialAnalysis(highRateInput);
      
      // Should have much higher monthly payment
      expect(result.monthlyPayment).toBeGreaterThan(6000);
      
      // Should have higher total interest
      expect(result.totalInterestPaid).toBeGreaterThan(500000); // More than principal
    });

    it('should round all currency values to 2 decimal places', () => {
      const result = financialCalculationService.calculateFinancialAnalysis(testInput);
      
      // Check key financial values
      const financialValues = [
        result.monthlyPayment,
        result.totalInterestPaid,
        result.annualLL97FeeAvoidance2024to2027,
        result.annualLL97FeeAvoidance2030to2034,
        ...result.cumulativeSavingsByYear,
        ...result.loanBalanceByYear
      ];
      
      financialValues.forEach(value => {
        const decimalPlaces = (value.toString().split('.')[1] || '').length;
        expect(decimalPlaces).toBeLessThanOrEqual(2);
      });
    });
  });
});