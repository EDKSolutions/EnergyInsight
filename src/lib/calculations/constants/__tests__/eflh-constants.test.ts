/**
 * EFLH Constants Tests
 * Tests EFLH lookup functions and calculations
 */

import { 
  getEFLHFromPluto, 
  calculateAnnualBuildingkWhHeatingPTHP,
  getBuildingTypeFromFloors,
  getConstructionEraFromYear,
  getAllEFLHValues,
  eflhTable,
  heatingCapacityPTHP,
  kWperKBtu,
  pthpCOP
} from '../eflh-constants';

describe('EFLH Constants', () => {
  describe('EFLH Table Values', () => {
    it('should have correct EFLH values from LaTeX document', () => {
      // Values from LaTeX Table
      expect(eflhTable.lowRise.prewar).toBe(974);
      expect(eflhTable.lowRise.pre79).toBe(738);
      expect(eflhTable.lowRise.post1979).toBe(705);
      expect(eflhTable.lowRise.post2007).toBe(491);
      
      expect(eflhTable.highRise.prewar).toBe(987);
      expect(eflhTable.highRise.pre79).toBe(513);
      expect(eflhTable.highRise.post1979).toBe(385);
      expect(eflhTable.highRise.post2007).toBe(214);
    });

    it('should have EFLH range 214-987 hours', () => {
      const allValues = getAllEFLHValues();
      
      expect(allValues.eflhRange.min).toBe(214);
      expect(allValues.eflhRange.max).toBe(987);
    });
  });

  describe('Building Type Classification', () => {
    it('should classify buildings by floor count', () => {
      expect(getBuildingTypeFromFloors(1)).toBe('lowRise');
      expect(getBuildingTypeFromFloors(6)).toBe('lowRise');
      expect(getBuildingTypeFromFloors(7)).toBe('highRise');
      expect(getBuildingTypeFromFloors(50)).toBe('highRise');
    });

    it('should handle boundary case at 6 floors', () => {
      expect(getBuildingTypeFromFloors(6)).toBe('lowRise'); // <= 6 is low rise
      expect(getBuildingTypeFromFloors(7)).toBe('highRise'); // > 6 is high rise
    });
  });

  describe('Construction Era Classification', () => {
    it('should classify buildings by year built', () => {
      expect(getConstructionEraFromYear(1920)).toBe('prewar');
      expect(getConstructionEraFromYear(1939)).toBe('prewar');
      expect(getConstructionEraFromYear(1940)).toBe('pre79');
      expect(getConstructionEraFromYear(1978)).toBe('pre79');
      expect(getConstructionEraFromYear(1979)).toBe('post1979');
      expect(getConstructionEraFromYear(2006)).toBe('post1979');
      expect(getConstructionEraFromYear(2007)).toBe('post2007');
      expect(getConstructionEraFromYear(2023)).toBe('post2007');
    });

    it('should handle boundary years correctly', () => {
      expect(getConstructionEraFromYear(1939)).toBe('prewar');
      expect(getConstructionEraFromYear(1940)).toBe('pre79');
      expect(getConstructionEraFromYear(1978)).toBe('pre79');
      expect(getConstructionEraFromYear(1979)).toBe('post1979');
      expect(getConstructionEraFromYear(2006)).toBe('post1979');
      expect(getConstructionEraFromYear(2007)).toBe('post2007');
    });
  });

  describe('getEFLHFromPluto', () => {
    it('should return correct EFLH for low-rise prewar building', () => {
      const eflh = getEFLHFromPluto(1930, 4);
      expect(eflh).toBe(974);
    });

    it('should return correct EFLH for high-rise modern building', () => {
      const eflh = getEFLHFromPluto(2010, 20);
      expect(eflh).toBe(214);
    });

    it('should return correct EFLH for mid-rise pre-79 building', () => {
      const eflh = getEFLHFromPluto(1960, 6);
      expect(eflh).toBe(738); // Low-rise pre-79
    });

    it('should return correct EFLH for high-rise pre-79 building', () => {
      const eflh = getEFLHFromPluto(1960, 12);
      expect(eflh).toBe(513); // High-rise pre-79
    });

    it('should handle LaTeX example: 1960s 6-story building', () => {
      // From LaTeX: "1960s 6-story building with 24 residential units"
      const eflh = getEFLHFromPluto(1960, 6);
      expect(eflh).toBe(738); // Low-rise, pre-79
    });

    it('should test all building type and era combinations', () => {
      // Low-rise buildings
      expect(getEFLHFromPluto(1920, 3)).toBe(974);  // prewar
      expect(getEFLHFromPluto(1960, 5)).toBe(738);  // pre79
      expect(getEFLHFromPluto(1990, 4)).toBe(705);  // post1979
      expect(getEFLHFromPluto(2015, 6)).toBe(491);  // post2007
      
      // High-rise buildings
      expect(getEFLHFromPluto(1920, 15)).toBe(987); // prewar
      expect(getEFLHFromPluto(1960, 12)).toBe(513); // pre79
      expect(getEFLHFromPluto(1990, 20)).toBe(385); // post1979
      expect(getEFLHFromPluto(2015, 30)).toBe(214); // post2007
    });
  });

  describe('PTHP Constants', () => {
    it('should have correct PTHP constants from LaTeX', () => {
      expect(heatingCapacityPTHP).toBe(8); // KBtu
      expect(kWperKBtu).toBe(3.412); // Conversion factor
      expect(pthpCOP).toBe(1.51); // Coefficient of Performance
    });
  });

  describe('calculateAnnualBuildingkWhHeatingPTHP', () => {
    it('should calculate annual kWh correctly', () => {
      // LaTeX example: 48 PTAC units, 738 EFLH
      const result = calculateAnnualBuildingkWhHeatingPTHP(48, 738);
      
      // Formula: (8 / 3.412) × (1 / 1.51) × 738 × 48
      const expected = (8 / 3.412) * (1 / 1.51) * 738 * 48;
      expect(result).toBeCloseTo(expected, 2);
    });

    it('should match LaTeX calculation step by step', () => {
      const ptacUnits = 48;
      const eflhHours = 738;
      
      // Step-by-step calculation from LaTeX
      const step1 = heatingCapacityPTHP / kWperKBtu; // 8 / 3.412 = 2.344
      const step2 = 1 / pthpCOP; // 1 / 1.51 = 0.662
      const step3 = step1 * step2 * eflhHours * ptacUnits;
      
      const result = calculateAnnualBuildingkWhHeatingPTHP(ptacUnits, eflhHours);
      expect(result).toBeCloseTo(step3, 2);
    });

    it('should scale linearly with PTAC units', () => {
      const baseResult = calculateAnnualBuildingkWhHeatingPTHP(10, 500);
      const doubleResult = calculateAnnualBuildingkWhHeatingPTHP(20, 500);
      
      expect(doubleResult).toBeCloseTo(baseResult * 2, 2);
    });

    it('should scale linearly with EFLH', () => {
      const baseResult = calculateAnnualBuildingkWhHeatingPTHP(10, 500);
      const doubleResult = calculateAnnualBuildingkWhHeatingPTHP(10, 1000);
      
      expect(doubleResult).toBeCloseTo(baseResult * 2, 2);
    });

    it('should handle zero values', () => {
      expect(calculateAnnualBuildingkWhHeatingPTHP(0, 500)).toBe(0);
      expect(calculateAnnualBuildingkWhHeatingPTHP(10, 0)).toBe(0);
      expect(calculateAnnualBuildingkWhHeatingPTHP(0, 0)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      const result = calculateAnnualBuildingkWhHeatingPTHP(13, 333); // Odd numbers likely to produce decimals
      
      const decimalPlaces = (result.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('should handle realistic building scenarios', () => {
      // Small building: 10 units, modern high-rise
      const small = calculateAnnualBuildingkWhHeatingPTHP(10, 214);
      expect(small).toBeGreaterThan(0);
      expect(small).toBeLessThan(10000);
      
      // Large building: 100 units, prewar low-rise
      const large = calculateAnnualBuildingkWhHeatingPTHP(100, 974);
      expect(large).toBeGreaterThan(small * 8); // Much higher due to more units and higher EFLH
      expect(large).toBeLessThan(200000);
    });
  });

  describe('Edge Cases and Data Integrity', () => {
    it('should have decreasing EFLH for newer buildings (generally)', () => {
      // Generally, newer buildings are more efficient and need less heating
      
      // Low-rise trend (with some exceptions)
      expect(eflhTable.lowRise.post2007).toBeLessThan(eflhTable.lowRise.post1979);
      expect(eflhTable.lowRise.post1979).toBeLessThan(eflhTable.lowRise.pre79);
      
      // High-rise trend
      expect(eflhTable.highRise.post2007).toBeLessThan(eflhTable.highRise.post1979);
      expect(eflhTable.highRise.post1979).toBeLessThan(eflhTable.highRise.pre79);
    });

    it('should handle extreme year values gracefully', () => {
      // Very old buildings should default to prewar
      expect(getConstructionEraFromYear(1800)).toBe('prewar');
      expect(getEFLHFromPluto(1800, 3)).toBe(974);
      
      // Future buildings should use post2007 values
      expect(getConstructionEraFromYear(2050)).toBe('post2007');
      expect(getEFLHFromPluto(2050, 3)).toBe(491);
    });

    it('should handle extreme floor values', () => {
      expect(getBuildingTypeFromFloors(-1)).toBe('lowRise'); // Negative floors -> low-rise
      expect(getBuildingTypeFromFloors(0)).toBe('lowRise');
      expect(getBuildingTypeFromFloors(1000)).toBe('highRise'); // Very tall -> high-rise
    });

    it('should maintain data consistency across all combinations', () => {
      // Test all 8 combinations (2 building types × 4 eras)
      const allCombinations = [];
      
      ['lowRise', 'highRise'].forEach(buildingType => {
        ['prewar', 'pre79', 'post1979', 'post2007'].forEach(era => {
          const value = eflhTable[buildingType as keyof typeof eflhTable][era as keyof typeof eflhTable.lowRise];
          allCombinations.push(value);
          
          // Each value should be a positive number
          expect(typeof value).toBe('number');
          expect(value).toBeGreaterThan(0);
          expect(value).toBeLessThan(2000); // Reasonable upper bound
        });
      });
      
      // Should have 8 unique combinations
      expect(allCombinations).toHaveLength(8);
    });

    it('should provide comprehensive data via getAllEFLHValues', () => {
      const allValues = getAllEFLHValues();
      
      expect(allValues.eflhTable).toEqual(eflhTable);
      expect(allValues.buildingTypes).toEqual(['lowRise', 'highRise']);
      expect(allValues.constructionEras).toEqual(['prewar', 'pre79', 'post1979', 'post2007']);
      expect(allValues.eflhRange.min).toBeGreaterThan(0);
      expect(allValues.eflhRange.max).toBeGreaterThan(allValues.eflhRange.min);
    });
  });
});