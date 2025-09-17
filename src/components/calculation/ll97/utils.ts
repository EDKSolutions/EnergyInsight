/**
 * LL97 Component Utilities
 * Helper functions for parsing and formatting LL97 data
 */

import { CalculationResult } from '@/types/calculation-result-type';

export interface PropertyUse {
  propertyType: string;
  squareFeet: number;
}

export interface CompliancePeriod {
  name: string;
  years: string;
  emissionsBudget: number | null;
  currentFee: number | null;
  adjustedFee: number | null;
  isCurrentPeriod: boolean;
}

/**
 * Parse property use breakdown from database field
 */
export function parsePropertyUseFromDB(propertyUseBreakdown: unknown): PropertyUse[] {
  if (!propertyUseBreakdown) {
    return [];
  }

  try {
    let propertyUseString: string;

    if (typeof propertyUseBreakdown === 'string') {
      propertyUseString = propertyUseBreakdown;
    } else if (typeof propertyUseBreakdown === 'object') {
      // Handle case where it's stored as parsed JSON
      propertyUseString = JSON.stringify(propertyUseBreakdown);
    } else {
      return [];
    }

    if (!propertyUseString || propertyUseString.trim() === '') {
      return [];
    }

    const propertyUses: PropertyUse[] = [];

    // Use regex to find all "Property Type (square_feet)" patterns
    const regex = /([^,()]+(?:\([^)]*\)[^,()]*)*)\s*\(([0-9.,]+)\)/g;
    let match;

    while ((match = regex.exec(propertyUseString)) !== null) {
      const propertyType = match[1].trim();
      const squareFeetStr = match[2].replace(/,/g, ''); // Remove commas
      const squareFeet = parseFloat(squareFeetStr);

      if (!isNaN(squareFeet) && squareFeet >= 0) {
        propertyUses.push({
          propertyType,
          squareFeet
        });
      }
    }

    return propertyUses;
  } catch (error) {
    console.error('Error parsing property use from database field:', error);
    return [];
  }
}

/**
 * Parse property use breakdown from LL84 raw data (legacy fallback)
 */
export function parsePropertyUseFromLL84(rawLL84Data: unknown[]): PropertyUse[] {
  if (!rawLL84Data || rawLL84Data.length === 0) {
    return [];
  }

  try {
    const ll84Record = rawLL84Data[0] as Record<string, unknown>;
    if (!ll84Record || typeof ll84Record !== 'object') {
      return [];
    }

    const propertyUseString = ll84Record.list_of_all_property_use as string;

    if (!propertyUseString || propertyUseString.trim() === '') {
      return [];
    }

    const propertyUses: PropertyUse[] = [];

    // Use regex to find all "Property Type (square_feet)" patterns
    const regex = /([^,()]+(?:\([^)]*\)[^,()]*)*)\s*\(([0-9.,]+)\)/g;
    let match;

    while ((match = regex.exec(propertyUseString)) !== null) {
      const propertyType = match[1].trim();
      const squareFeetStr = match[2].replace(/,/g, ''); // Remove commas
      const squareFeet = parseFloat(squareFeetStr);

      if (!isNaN(squareFeet) && squareFeet >= 0) {
        propertyUses.push({
          propertyType,
          squareFeet
        });
      }
    }

    return propertyUses;
  } catch (error) {
    console.error('Error parsing property use from LL84 data:', error);
    return [];
  }
}

/**
 * Get compliance periods with their data
 */
export function getCompliancePeriods(c: CalculationResult): CompliancePeriod[] {
  const currentYear = new Date().getFullYear();

  return [
    {
      name: "2024-2029",
      years: "2024-2029",
      emissionsBudget: c.emissionsBudget2024to2029 ? parseFloat(c.emissionsBudget2024to2029.toString()) : null,
      currentFee: c.annualFeeExceedingBudget2024to2029 ? parseFloat(c.annualFeeExceedingBudget2024to2029.toString()) : null,
      adjustedFee: c.adjustedAnnualFeeBefore2027 ? parseFloat(c.adjustedAnnualFeeBefore2027.toString()) : null,
      isCurrentPeriod: currentYear >= 2024 && currentYear <= 2029
    },
    {
      name: "2030-2034",
      years: "2030-2034",
      emissionsBudget: c.emissionsBudget2030to2034 ? parseFloat(c.emissionsBudget2030to2034.toString()) : null,
      currentFee: c.annualFeeExceedingBudget2030to2034 ? parseFloat(c.annualFeeExceedingBudget2030to2034.toString()) : null,
      adjustedFee: c.adjustedAnnualFee2030to2034 ? parseFloat(c.adjustedAnnualFee2030to2034.toString()) : null,
      isCurrentPeriod: currentYear >= 2030 && currentYear <= 2034
    },
    {
      name: "2035-2039",
      years: "2035-2039",
      emissionsBudget: c.emissionsBudget2035to2039 ? parseFloat(c.emissionsBudget2035to2039.toString()) : null,
      currentFee: c.annualFeeExceedingBudget2035to2039 ? parseFloat(c.annualFeeExceedingBudget2035to2039.toString()) : null,
      adjustedFee: c.adjustedAnnualFee2035to2039 ? parseFloat(c.adjustedAnnualFee2035to2039.toString()) : null,
      isCurrentPeriod: currentYear >= 2035 && currentYear <= 2039
    },
    {
      name: "2040-2049",
      years: "2040-2049",
      emissionsBudget: c.emissionsBudget2040to2049 ? parseFloat(c.emissionsBudget2040to2049.toString()) : null,
      currentFee: c.annualFeeExceedingBudget2040to2049 ? parseFloat(c.annualFeeExceedingBudget2040to2049.toString()) : null,
      adjustedFee: c.adjustedAnnualFee2040to2049 ? parseFloat(c.adjustedAnnualFee2040to2049.toString()) : null,
      isCurrentPeriod: currentYear >= 2040 && currentYear <= 2049
    }
  ];
}

/**
 * Calculate total square footage from property uses
 */
export function getTotalSquareFootage(propertyUses: PropertyUse[]): number {
  return propertyUses.reduce((total, use) => total + use.squareFeet, 0);
}

/**
 * Format currency values
 */
export function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format emissions values
 */
export function formatEmissions(value: number | null): string {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value) + ' tCO₂e';
}

/**
 * Get BE credit info based on current year
 */
export function getBECreditInfo(c: CalculationResult) {
  const currentYear = new Date().getFullYear();
  const creditBefore2027 = c.beCreditBefore2027 ? parseFloat(c.beCreditBefore2027.toString()) : 0;
  const credit2027to2029 = c.beCredit2027to2029 ? parseFloat(c.beCredit2027to2029.toString()) : 0;

  return {
    currentCredit: currentYear < 2027 ? creditBefore2027 : credit2027to2029,
    fullCredit: creditBefore2027,
    reducedCredit: credit2027to2029,
    isFullCreditPeriod: currentYear < 2027,
    yearsLeftForFullCredit: Math.max(0, 2027 - currentYear),
  };
}