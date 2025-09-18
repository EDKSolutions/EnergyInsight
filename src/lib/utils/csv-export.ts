import { Calculations } from '@prisma/client';

export interface CSVExportOptions {
  includeJsonFields?: boolean;
  dateFormat?: 'iso' | 'us' | 'short';
  floatPrecision?: number;
}

export function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function formatDateForCSV(date: Date | null | undefined, format: 'iso' | 'us' | 'short' = 'iso'): string {
  if (!date) return '';

  switch (format) {
    case 'us':
      return date.toLocaleDateString('en-US');
    case 'short':
      return date.toISOString().split('T')[0];
    case 'iso':
    default:
      return date.toISOString();
  }
}

export function formatNumberForCSV(value: number | null | undefined, precision: number = 2): string {
  if (value === null || value === undefined) return '';
  return value.toFixed(precision);
}

export function flattenJsonArray(jsonValue: unknown, fieldName: string): Record<string, string> {
  if (!jsonValue) return {};

  try {
    const parsed = typeof jsonValue === 'string' ? JSON.parse(jsonValue) : jsonValue;

    if (Array.isArray(parsed)) {
      const result: Record<string, string> = {};
      parsed.forEach((item, index) => {
        if (typeof item === 'object') {
          Object.entries(item).forEach(([key, value]) => {
            result[`${fieldName}_${index}_${key}`] = String(value || '');
          });
        } else {
          result[`${fieldName}_${index}`] = String(item || '');
        }
      });
      return result;
    } else if (typeof parsed === 'object') {
      const result: Record<string, string> = {};
      Object.entries(parsed).forEach(([key, value]) => {
        result[`${fieldName}_${key}`] = String(value || '');
      });
      return result;
    }
  } catch (error) {
    console.warn(`Failed to parse JSON field ${fieldName}:`, error);
  }

  return { [fieldName]: String(jsonValue || '') };
}

export function calculationToCSVRow(calculation: Calculations, options: CSVExportOptions = {}): Record<string, string> {
  const {
    includeJsonFields = true,
    dateFormat = 'iso',
    floatPrecision = 2
  } = options;

  const row: Record<string, string> = {
    // Core identifiers
    id: calculation.id,
    bbl: calculation.bbl,
    address: calculation.address,
    boro: calculation.boro,

    // Building characteristics
    yearBuilt: String(calculation.yearBuilt),
    stories: String(calculation.stories),
    buildingClass: calculation.buildingClass,
    totalSquareFeet: formatNumberForCSV(calculation.totalSquareFeet, 0),
    totalResidentialUnits: String(calculation.totalResidentialUnits),
    ptacUnits: String(calculation.ptacUnits),
    isRentStabilized: calculation.isRentStabilized ? 'true' : 'false',

    // Financial basics
    capRate: formatNumberForCSV(calculation.capRate, 2),
    buildingValue: formatNumberForCSV(calculation.buildingValue, 0),

    // Energy calculations - PTAC
    annualBuildingMMBtuCoolingPTAC: formatNumberForCSV(calculation.annualBuildingMMBtuCoolingPTAC, floatPrecision),
    annualBuildingMMBtuHeatingPTAC: formatNumberForCSV(calculation.annualBuildingMMBtuHeatingPTAC, floatPrecision),
    annualBuildingMMBtuTotalPTAC: formatNumberForCSV(calculation.annualBuildingMMBtuTotalPTAC, floatPrecision),
    annualBuildingThermsHeatingPTAC: formatNumberForCSV(calculation.annualBuildingThermsHeatingPTAC, floatPrecision),
    annualBuildingkWhCoolingPTAC: formatNumberForCSV(calculation.annualBuildingkWhCoolingPTAC, 0),
    annualBuildingCostPTAC: formatNumberForCSV(calculation.annualBuildingCostPTAC, 2),

    // Energy calculations - PTHP
    annualBuildingMMBtuHeatingPTHP: formatNumberForCSV(calculation.annualBuildingMMBtuHeatingPTHP, floatPrecision),
    annualBuildingMMBtuCoolingPTHP: formatNumberForCSV(calculation.annualBuildingMMBtuCoolingPTHP, floatPrecision),
    annualBuildingMMBtuTotalPTHP: formatNumberForCSV(calculation.annualBuildingMMBtuTotalPTHP, floatPrecision),
    annualBuildingkWhCoolingPTHP: formatNumberForCSV(calculation.annualBuildingkWhCoolingPTHP, 0),
    annualBuildingkWhHeatingPTHP: formatNumberForCSV(calculation.annualBuildingkWhHeatingPTHP, 0),
    annualBuildingCostPTHP: formatNumberForCSV(calculation.annualBuildingCostPTHP, 2),

    // Energy savings and efficiency
    energyReductionPercentage: formatNumberForCSV(calculation.energyReductionPercentage, 2),
    annualEnergySavings: formatNumberForCSV(calculation.annualEnergySavings, 2),
    eflhHours: String(calculation.eflhHours || ''),

    // Retrofit costs
    totalRetrofitCost: formatNumberForCSV(calculation.totalRetrofitCost, 2),
    simplePaybackPeriod: String(calculation.simplePaybackPeriod || ''),

    // LL97 emissions budgets
    emissionsBudget2024to2029: formatNumberForCSV(calculation.emissionsBudget2024to2029, floatPrecision),
    emissionsBudget2030to2034: formatNumberForCSV(calculation.emissionsBudget2030to2034, floatPrecision),
    emissionsBudget2035to2039: formatNumberForCSV(calculation.emissionsBudget2035to2039, floatPrecision),
    emissionsBudget2040to2049: formatNumberForCSV(calculation.emissionsBudget2040to2049, floatPrecision),
    totalBuildingEmissionsLL84: formatNumberForCSV(calculation.totalBuildingEmissionsLL84, floatPrecision),

    // LL97 fees (without upgrade)
    annualFeeExceedingBudget2024to2029: formatNumberForCSV(calculation.annualFeeExceedingBudget2024to2029, 2),
    annualFeeExceedingBudget2030to2034: formatNumberForCSV(calculation.annualFeeExceedingBudget2030to2034, 2),
    annualFeeExceedingBudget2035to2039: formatNumberForCSV(calculation.annualFeeExceedingBudget2035to2039, 2),
    annualFeeExceedingBudget2040to2049: formatNumberForCSV(calculation.annualFeeExceedingBudget2040to2049, 2),

    // BE credits and adjusted emissions
    beCreditBefore2027: formatNumberForCSV(calculation.beCreditBefore2027, floatPrecision),
    beCredit2027to2029: formatNumberForCSV(calculation.beCredit2027to2029, floatPrecision),
    adjustedTotalBuildingEmissions2024to2029: formatNumberForCSV(calculation.adjustedTotalBuildingEmissions2024to2029, floatPrecision),
    adjustedTotalBuildingEmissions2030to2034: formatNumberForCSV(calculation.adjustedTotalBuildingEmissions2030to2034, floatPrecision),
    adjustedTotalBuildingEmissions2035to2039: formatNumberForCSV(calculation.adjustedTotalBuildingEmissions2035to2039, floatPrecision),
    adjustedTotalBuildingEmissions2040to2049: formatNumberForCSV(calculation.adjustedTotalBuildingEmissions2040to2049, floatPrecision),

    // Adjusted LL97 fees (with upgrade)
    adjustedAnnualFeeBefore2027: formatNumberForCSV(calculation.adjustedAnnualFeeBefore2027, 2),
    adjustedAnnualFee2027to2029: formatNumberForCSV(calculation.adjustedAnnualFee2027to2029, 2),
    adjustedAnnualFee2030to2034: formatNumberForCSV(calculation.adjustedAnnualFee2030to2034, 2),
    adjustedAnnualFee2035to2039: formatNumberForCSV(calculation.adjustedAnnualFee2035to2039, 2),
    adjustedAnnualFee2040to2049: formatNumberForCSV(calculation.adjustedAnnualFee2040to2049, 2),

    // LL97 fee avoidance (savings)
    annualLL97FeeAvoidance2024to2027: formatNumberForCSV(calculation.annualLL97FeeAvoidance2024to2027, 2),
    annualLL97FeeAvoidance2027to2029: formatNumberForCSV(calculation.annualLL97FeeAvoidance2027to2029, 2),
    annualLL97FeeAvoidance2030to2034: formatNumberForCSV(calculation.annualLL97FeeAvoidance2030to2034, 2),
    annualLL97FeeAvoidance2035to2039: formatNumberForCSV(calculation.annualLL97FeeAvoidance2035to2039, 2),
    annualLL97FeeAvoidance2040to2049: formatNumberForCSV(calculation.annualLL97FeeAvoidance2040to2049, 2),

    // Financial analysis
    monthlyPayment: formatNumberForCSV(calculation.monthlyPayment, 2),
    totalInterestPaid: formatNumberForCSV(calculation.totalInterestPaid, 2),

    // NOI analysis
    annualBuildingNOI: formatNumberForCSV(calculation.annualBuildingNOI, 2),

    // Property value analysis
    propertyValueNoUpgrade: formatNumberForCSV(calculation.propertyValueNoUpgrade, 0),
    propertyValueWithUpgrade: formatNumberForCSV(calculation.propertyValueWithUpgrade, 0),
    netPropertyValueGain: formatNumberForCSV(calculation.netPropertyValueGain, 0),

    // Pricing configuration
    priceKwhHour: formatNumberForCSV(calculation.priceKwhHour, 4),
    priceThermHour: formatNumberForCSV(calculation.priceThermHour, 4),
    pthpUnitCost: formatNumberForCSV(calculation.pthpUnitCost, 2),
    pthpInstallationCost: formatNumberForCSV(calculation.pthpInstallationCost, 2),
    pthpContingency: formatNumberForCSV(calculation.pthpContingency, 3),

    // Metadata
    unitBreakdownSource: calculation.unitBreakdownSource || '',
    aiAnalysisNotes: calculation.aiAnalysisNotes || '',
    lastCalculatedService: calculation.lastCalculatedService || '',
    createdAt: formatDateForCSV(calculation.createdAt, dateFormat),
    updatedAt: formatDateForCSV(calculation.updatedAt, dateFormat)
  };

  // Handle JSON fields if requested
  if (includeJsonFields) {
    // Unit mix breakdown
    const unitMixFlattened = flattenJsonArray(calculation.unitMixBreakDown, 'unitMix');
    Object.assign(row, unitMixFlattened);

    // Property use breakdown
    const propertyUseFlattened = flattenJsonArray(calculation.propertyUseBreakdown, 'propertyUse');
    Object.assign(row, propertyUseFlattened);

    // Emissions limits breakdown
    const emissionsLimitsFlattened = flattenJsonArray(calculation.emissionsLimitsBreakdown, 'emissionsLimits');
    Object.assign(row, emissionsLimitsFlattened);

    // Time series data (simplified to summary values)
    if (calculation.cumulativeSavingsByYear) {
      try {
        const cumulativeSavings = typeof calculation.cumulativeSavingsByYear === 'string'
          ? JSON.parse(calculation.cumulativeSavingsByYear)
          : calculation.cumulativeSavingsByYear;
        if (Array.isArray(cumulativeSavings) && cumulativeSavings.length > 0) {
          row.cumulativeSavingsYear1 = formatNumberForCSV(cumulativeSavings[0], 2);
          row.cumulativeSavingsYear5 = formatNumberForCSV(cumulativeSavings[4], 2);
          row.cumulativeSavingsYear10 = formatNumberForCSV(cumulativeSavings[9], 2);
          row.cumulativeSavingsYear20 = formatNumberForCSV(cumulativeSavings[19], 2);
        }
      } catch (e) {
        console.warn('Failed to parse cumulativeSavingsByYear:', e);
      }
    }

    if (calculation.loanBalanceByYear) {
      try {
        const loanBalance = typeof calculation.loanBalanceByYear === 'string'
          ? JSON.parse(calculation.loanBalanceByYear)
          : calculation.loanBalanceByYear;
        if (Array.isArray(loanBalance) && loanBalance.length > 0) {
          row.loanBalanceYear1 = formatNumberForCSV(loanBalance[0], 2);
          row.loanBalanceYear5 = formatNumberForCSV(loanBalance[4], 2);
          row.loanBalanceYear10 = formatNumberForCSV(loanBalance[9], 2);
        }
      } catch (e) {
        console.warn('Failed to parse loanBalanceByYear:', e);
      }
    }

    // Raw data summary (just indicate presence)
    row.hasRawPlutoData = calculation.rawPlutoData ? 'true' : 'false';
    row.hasRawLL84Data = calculation.rawLL84Data ? 'true' : 'false';
  }

  return row;
}

export function calculationsToCSV(calculations: Calculations[], options: CSVExportOptions = {}): string {
  if (calculations.length === 0) {
    return 'No calculations found';
  }

  // Convert all calculations to rows
  const rows = calculations.map(calc => calculationToCSVRow(calc, options));

  // Get all unique headers
  const allHeaders = new Set<string>();
  rows.forEach(row => {
    Object.keys(row).forEach(header => allHeaders.add(header));
  });

  const headers = Array.from(allHeaders).sort();

  // Build CSV content
  const csvRows: string[] = [];

  // Add header row
  csvRows.push(headers.map(escapeCSVValue).join(','));

  // Add data rows
  rows.forEach(row => {
    const values = headers.map(header => escapeCSVValue(row[header] || ''));
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

export function generateCSVFilename(prefix: string = 'calculations-export'): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  return `${prefix}-${dateStr}-${timeStr}.csv`;
}