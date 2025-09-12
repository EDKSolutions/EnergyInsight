import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/app/api/auth/middleware';
import fs from 'fs/promises';
import path from 'path';
import { CumulativeSavingsData, LoanBalanceData } from '@/lib/calculations/constants/financial-constants';

// Types for NOI and Property Value data
type NOIYearData = { year: number; noi: number };
type PropertyValueYearData = { year: number; value: number };

/**
 * @swagger
 * /api/calculations/{id}/latex-report:
 *   post:
 *     tags: [Calculations]
 *     summary: Generate LaTeX report for a specific calculation
 *     description: |
 *       Generates a personalized LaTeX report showing end-to-end math and analysis
 *       for a specific building's PTAC to PTHP conversion calculation.
 *       
 *       The report includes:
 *       - Building characteristics and unit breakdown
 *       - Step-by-step energy calculations (PTAC vs PTHP)
 *       - LL97 compliance analysis with actual emissions data
 *       - Financial projections and payback analysis
 *       - NOI and property value impacts
 *       - Three visualization charts with real data
 *       
 *       Returns LaTeX source code that can be compiled to PDF using LuaLaTeX.
 *       
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Calculation UUID
 *         example: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *     responses:
 *       200:
 *         description: LaTeX report generated successfully
 *         content:
 *           application/x-latex:
 *             schema:
 *               type: string
 *               description: Complete LaTeX document source code
 *           text/plain:
 *             schema:
 *               type: string
 *               description: Complete LaTeX document source code
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: 'attachment; filename="building-report-123MainSt.tex"'
 *       400:
 *         description: Invalid calculation ID or missing data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid calculation ID format"
 *                 details:
 *                   type: string
 *                   example: "Calculation ID must be a valid UUID"
 *       404:
 *         description: Calculation not found or user not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Calculation not found"
 *       500:
 *         description: Server error during LaTeX generation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to generate LaTeX report"
 *                 details:
 *                   type: string
 *     security:
 *       - BearerAuth: []
 */

interface CalculationData {
  id: string;
  bbl: string;
  address: string;
  boro: string;
  yearBuilt: number;
  stories: number;
  buildingClass: string;
  totalSquareFeet: number;
  totalResidentialUnits: number;
  ptacUnits: number;
  isRentStabilized: boolean | null;
  unitMixBreakDown: string;
  capRate: number;
  buildingValue: number;

  // Energy calculations
  annualBuildingMMBtuCoolingPTAC: number | null;
  annualBuildingMMBtuHeatingPTAC: number | null;
  annualBuildingMMBtuTotalPTAC: number | null;
  annualBuildingMMBtuHeatingPTHP: number | null;
  annualBuildingMMBtuCoolingPTHP: number | null;
  annualBuildingMMBtuTotalPTHP: number | null;
  energyReductionPercentage: number | null;
  totalRetrofitCost: number | null;
  annualBuildingThermsHeatingPTAC: number | null;
  annualBuildingkWhCoolingPTAC: number | null;
  annualBuildingkWhCoolingPTHP: number | null;
  annualBuildingCostPTAC: number | null;
  annualBuildingCostPTHP: number | null;
  annualEnergySavings: number | null;
  eflhHours: number | null;
  annualBuildingkWhHeatingPTHP: number | null;

  // LL97 data
  emissionsBudget2024to2029: number | null;
  emissionsBudget2030to2034: number | null;
  emissionsBudget2035to2039: number | null;
  emissionsBudget2040to2049: number | null;
  totalBuildingEmissionsLL84: number | null;
  annualFeeExceedingBudget2024to2029: number | null;
  annualFeeExceedingBudget2030to2034: number | null;
  annualFeeExceedingBudget2035to2039: number | null;
  annualFeeExceedingBudget2040to2049: number | null;
  beCreditBefore2027: number | null;
  beCredit2027to2029: number | null;
  adjustedAnnualFeeBefore2027: number | null;
  adjustedAnnualFee2027to2029: number | null;
  adjustedAnnualFee2030to2034: number | null;
  adjustedAnnualFee2035to2039: number | null;
  adjustedAnnualFee2040to2049: number | null;

  // Financial analysis
  annualLL97FeeAvoidance2024to2027: number | null;
  annualLL97FeeAvoidance2027to2029: number | null;
  annualLL97FeeAvoidance2030to2034: number | null;
  annualLL97FeeAvoidance2035to2039: number | null;
  annualLL97FeeAvoidance2040to2049: number | null;
  simplePaybackPeriod: number | null;
  cumulativeSavingsByYear: CumulativeSavingsData[] | null;
  loanBalanceByYear: LoanBalanceData[] | null;
  monthlyPayment: number | null;
  totalInterestPaid: number | null;

  // NOI and property value
  annualBuildingNOI: number | null;
  noiByYearNoUpgrade: NOIYearData[] | null;
  noiByYearWithUpgrade: NOIYearData[] | null;
  propertyValueNoUpgrade: number | null;
  propertyValueWithUpgrade: number | null;
  netPropertyValueGain: number | null;
  propertyValueByYearNoUpgrade: PropertyValueYearData[] | null;
  propertyValueByYearWithUpgrade: PropertyValueYearData[] | null;
}

interface UnitBreakdown {
  studio: number;
  one_bed: number;
  two_bed: number;
  three_plus: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Authenticate the request
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: calculationId } = await params;

    // Validate calculation ID format
    if (!calculationId || typeof calculationId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid calculation ID format', details: 'Calculation ID must be provided as a string' },
        { status: 400 }
      );
    }

    // Fetch calculation data from database
    const calculation = await prisma.calculations.findFirst({
      where: {
        id: calculationId,
        users: {
          some: {
            userId: user.userId
          }
        }
      }
    });

    if (!calculation) {
      return NextResponse.json(
        { error: 'Calculation not found', details: 'Either the calculation does not exist or you do not have access to it' },
        { status: 404 }
      );
    }

    // Validate that calculation has required data
    const missingFields = validateCalculationData(calculation);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Incomplete calculation data', 
          details: `Missing required fields: ${missingFields.join(', ')}. Please run all calculation services first.` 
        },
        { status: 400 }
      );
    }

    // Generate LaTeX report
    const latexContent = await generateLatexReport(calculation as CalculationData);

    // Create filename based on address
    const sanitizedAddress = calculation.address
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .substring(0, 20);
    const filename = `building-report-${sanitizedAddress}.tex`;

    // Return LaTeX content
    return new NextResponse(latexContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-latex',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error generating LaTeX report:', error);
    return NextResponse.json(
      { error: 'Failed to generate LaTeX report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Validate that calculation has all required data for LaTeX generation
 */
function validateCalculationData(calculation: CalculationData): string[] {
  const requiredFields = [
    'bbl', 'address', 'boro', 'yearBuilt', 'stories', 'buildingClass',
    'totalSquareFeet', 'totalResidentialUnits', 'ptacUnits', 'unitMixBreakDown',
    'capRate', 'buildingValue',
    'annualBuildingMMBtuTotalPTAC', 'annualBuildingMMBtuTotalPTHP',
    'energyReductionPercentage', 'totalRetrofitCost', 'annualEnergySavings',
    'eflhHours', 'annualBuildingkWhHeatingPTHP',
    'totalBuildingEmissionsLL84', 'simplePaybackPeriod'
  ];

  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (calculation[field] === null || calculation[field] === undefined) {
      missingFields.push(field);
    }
  }

  return missingFields;
}

/**
 * Generate LaTeX report from calculation data
 */
async function generateLatexReport(calculation: CalculationData): Promise<string> {
  // Load LaTeX template
  const templatePath = path.join(process.cwd(), 'docs', 'latex-templates', 'building-report-template.tex');
  let template = await fs.readFile(templatePath, 'utf-8');

  // Parse unit breakdown
  const unitBreakdown: UnitBreakdown = JSON.parse(calculation.unitMixBreakDown);

  // Format numbers for display
  const formatNumber = (num: number | null, decimals = 0): string => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    });
  };

  const formatCurrency = (num: number | null): string => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  };

  // Calculate derived values
  const heatingCostPTAC = (calculation.annualBuildingThermsHeatingPTAC || 0) * 1.45;
  const coolingCostPTAC = (calculation.annualBuildingkWhCoolingPTAC || 0) * 0.24;
  const totalKWhPTHP = (calculation.annualBuildingkWhHeatingPTHP || 0) + (calculation.annualBuildingkWhCoolingPTHP || 0);

  // Generate visualization coordinates
  const cumulativeCoords = generateCumulativeSavingsCoordinates(calculation.cumulativeSavingsByYear);
  const loanBalanceCoords = generateLoanBalanceCoordinates(calculation.loanBalanceByYear);
  const propertyNoUpgradeCoords = generatePropertyValueCoordinates(calculation.propertyValueByYearNoUpgrade);
  const propertyWithUpgradeCoords = generatePropertyValueCoordinates(calculation.propertyValueByYearWithUpgrade);
  const noiNoUpgradeCoords = generateNOICoordinates(calculation.noiByYearNoUpgrade);
  const noiWithUpgradeCoords = generateNOICoordinates(calculation.noiByYearWithUpgrade);

  // Generate data tables for auditing
  const noiDataTable = generateNOIDataTable(calculation.noiByYearNoUpgrade, calculation.noiByYearWithUpgrade);
  const propertyValueDataTable = generatePropertyValueDataTable(calculation.propertyValueByYearNoUpgrade, calculation.propertyValueByYearWithUpgrade);
  const cumulativeSavingsDataTable = generateCumulativeSavingsDataTable(calculation.cumulativeSavingsByYear, calculation.loanBalanceByYear);

  // Calculate dynamic scaling for charts
  const chartScales = calculateChartScales(calculation);

  // Replace template variables
  const replacements: Record<string, string> = {
    // Building info
    'ADDRESS': calculation.address,
    'BOROUGH': calculation.boro,
    'BBL': calculation.bbl,
    'BUILDING_CLASS': calculation.buildingClass,
    'YEAR_BUILT': calculation.yearBuilt.toString(),
    'STORIES': calculation.stories.toString(),
    'TOTAL_SQ_FT': formatNumber(calculation.totalSquareFeet),
    'TOTAL_UNITS': calculation.totalResidentialUnits.toString(),
    'PTAC_UNITS': calculation.ptacUnits.toString(),
    'CAP_RATE': (calculation.capRate).toFixed(1),

    // Unit breakdown
    'UNIT_BREAKDOWN_SOURCE': 'Database',
    'STUDIO_UNITS': unitBreakdown.studio.toString(),
    'ONE_BED_UNITS': unitBreakdown.one_bed.toString(),
    'TWO_BED_UNITS': unitBreakdown.two_bed.toString(),
    'THREE_PLUS_UNITS': unitBreakdown.three_plus.toString(),

    // PTAC energy
    'ANNUAL_BUILDING_THERMS_PTAC': formatNumber(calculation.annualBuildingThermsHeatingPTAC),
    'ANNUAL_BUILDING_MMBTU_HEATING_PTAC': formatNumber(calculation.annualBuildingMMBtuHeatingPTAC, 1),
    'ANNUAL_BUILDING_KWH_COOLING_PTAC': formatNumber(calculation.annualBuildingkWhCoolingPTAC),
    'ANNUAL_BUILDING_MMBTU_COOLING_PTAC': formatNumber(calculation.annualBuildingMMBtuCoolingPTAC, 1),
    'ANNUAL_BUILDING_MMBTU_TOTAL_PTAC': formatNumber(calculation.annualBuildingMMBtuTotalPTAC, 1),

    // PTAC costs
    'HEATING_COST_PTAC': formatCurrency(heatingCostPTAC),
    'COOLING_COST_PTAC': formatCurrency(coolingCostPTAC),
    'ANNUAL_BUILDING_COST_PTAC': formatCurrency(calculation.annualBuildingCostPTAC),

    // PTHP energy
    'EFLH_HOURS': (calculation.eflhHours || 0).toString(),
    'ANNUAL_BUILDING_KWH_HEATING_PTHP': formatNumber(calculation.annualBuildingkWhHeatingPTHP),
    'ANNUAL_BUILDING_MMBTU_HEATING_PTHP': formatNumber(calculation.annualBuildingMMBtuHeatingPTHP, 1),
    'ANNUAL_BUILDING_KWH_COOLING_PTHP': formatNumber(calculation.annualBuildingkWhCoolingPTHP),
    'ANNUAL_BUILDING_MMBTU_COOLING_PTHP': formatNumber(calculation.annualBuildingMMBtuCoolingPTHP, 1),
    'ANNUAL_BUILDING_MMBTU_TOTAL_PTHP': formatNumber(calculation.annualBuildingMMBtuTotalPTHP, 1),
    'TOTAL_KWH_PTHP': formatNumber(totalKWhPTHP),
    'ANNUAL_BUILDING_COST_PTHP': formatCurrency(calculation.annualBuildingCostPTHP),

    // Energy savings
    'ENERGY_REDUCTION_PCT': formatNumber(calculation.energyReductionPercentage, 1),
    'ANNUAL_ENERGY_SAVINGS': formatCurrency(calculation.annualEnergySavings),
    'TOTAL_RETROFIT_COST': formatCurrency(calculation.totalRetrofitCost),

    // LL97 data
    'TOTAL_BUILDING_EMISSIONS_LL84': formatNumber(calculation.totalBuildingEmissionsLL84, 1),
    'EMISSIONS_BUDGET_2024_2029': formatNumber(calculation.emissionsBudget2024to2029, 1),
    'EMISSIONS_BUDGET_2030_2034': formatNumber(calculation.emissionsBudget2030to2034, 1),
    'EMISSIONS_BUDGET_2035_2039': formatNumber(calculation.emissionsBudget2035to2039, 1),
    'EMISSIONS_BUDGET_2040_2049': formatNumber(calculation.emissionsBudget2040to2049, 1),
    'BE_CREDIT_BEFORE_2027': formatNumber(calculation.beCreditBefore2027, 1),
    'BE_CREDIT_2027_2029': formatNumber(calculation.beCredit2027to2029, 1),

    // LL97 fees
    'ANNUAL_FEE_NO_UPGRADE_2024_2029': formatCurrency(calculation.annualFeeExceedingBudget2024to2029),
    'ANNUAL_FEE_NO_UPGRADE_2030_2034': formatCurrency(calculation.annualFeeExceedingBudget2030to2034),
    'ANNUAL_FEE_NO_UPGRADE_2035_2039': formatCurrency(calculation.annualFeeExceedingBudget2035to2039),
    'ANNUAL_FEE_NO_UPGRADE_2040_2049': formatCurrency(calculation.annualFeeExceedingBudget2040to2049),
    'ADJUSTED_ANNUAL_FEE_BEFORE_2027': formatCurrency(calculation.adjustedAnnualFeeBefore2027),
    'ADJUSTED_ANNUAL_FEE_2027_2029': formatCurrency(calculation.adjustedAnnualFee2027to2029),
    'ADJUSTED_ANNUAL_FEE_2030_2034': formatCurrency(calculation.adjustedAnnualFee2030to2034),
    'ADJUSTED_ANNUAL_FEE_2035_2039': formatCurrency(calculation.adjustedAnnualFee2035to2039),
    'ADJUSTED_ANNUAL_FEE_2040_2049': formatCurrency(calculation.adjustedAnnualFee2040to2049),

    // Financial
    'PAYBACK_PERIOD': (calculation.simplePaybackPeriod || 0).toString(),
    'MONTHLY_PAYMENT': formatCurrency(calculation.monthlyPayment),
    'TOTAL_INTEREST_PAID': formatCurrency(calculation.totalInterestPaid),
    'ANNUAL_LL97_FEE_AVOIDANCE_2024_2027': formatCurrency(calculation.annualLL97FeeAvoidance2024to2027),
    'ANNUAL_LL97_FEE_AVOIDANCE_2027_2029': formatCurrency(calculation.annualLL97FeeAvoidance2027to2029),
    'ANNUAL_LL97_FEE_AVOIDANCE_2030_2034': formatCurrency(calculation.annualLL97FeeAvoidance2030to2034),
    'ANNUAL_LL97_FEE_AVOIDANCE_2035_2039': formatCurrency(calculation.annualLL97FeeAvoidance2035to2039),
    'ANNUAL_LL97_FEE_AVOIDANCE_2040_2049': formatCurrency(calculation.annualLL97FeeAvoidance2040to2049),

    // NOI and property value
    'ANNUAL_BUILDING_NOI': formatCurrency(calculation.annualBuildingNOI),
    'IS_RENT_STABILIZED': calculation.isRentStabilized ? 'Yes' : 'No',
    'PROPERTY_VALUE_NO_UPGRADE': formatCurrency(calculation.propertyValueNoUpgrade),
    'PROPERTY_VALUE_WITH_UPGRADE': formatCurrency(calculation.propertyValueWithUpgrade),
    'NET_PROPERTY_VALUE_GAIN': formatCurrency(calculation.netPropertyValueGain),

    // Chart coordinates
    'CUMULATIVE_SAVINGS_COORDINATES': cumulativeCoords,
    'LOAN_BALANCE_COORDINATES': loanBalanceCoords,
    'PROPERTY_VALUE_NO_UPGRADE_COORDINATES': propertyNoUpgradeCoords,
    'PROPERTY_VALUE_WITH_UPGRADE_COORDINATES': propertyWithUpgradeCoords,
    'NOI_NO_UPGRADE_COORDINATES': noiNoUpgradeCoords,
    'NOI_WITH_UPGRADE_COORDINATES': noiWithUpgradeCoords,

    // Dynamic chart scaling
    'NOI_Y_MIN': chartScales.noiYMin,
    'NOI_Y_MAX': chartScales.noiYMax,
    'PROPERTY_VALUE_Y_MIN': chartScales.propertyValueYMin,
    'PROPERTY_VALUE_Y_MAX': chartScales.propertyValueYMax,
    'PROPERTY_VALUE_GAP_Y_MIN': chartScales.propertyValueGapYMin,
    'PROPERTY_VALUE_GAP_Y_MAX': chartScales.propertyValueGapYMax,
    'PROPERTY_VALUE_GAP_CENTER': chartScales.propertyValueGapCenter,
    'PROPERTY_VALUE_GAP_LABEL': chartScales.propertyValueGapLabel,
    'LOAN_CHART_Y_MIN': chartScales.loanChartYMin,
    'LOAN_CHART_Y_MAX': chartScales.loanChartYMax,
    'LOAN_CHART_ANNOTATION_Y': chartScales.loanChartAnnotationY,
    'LOAN_CHART_LABEL_Y': chartScales.loanChartLabelY,

    // Data tables for auditing
    'NOI_DATA_TABLE': noiDataTable,
    'PROPERTY_VALUE_DATA_TABLE': propertyValueDataTable,
    'CUMULATIVE_SAVINGS_DATA_TABLE': cumulativeSavingsDataTable,

    // Display formatting
    'IS_RENT_STABILIZED_DISPLAY': calculation.isRentStabilized ? 'Yes' : 'No',
  };

  // Apply replacements
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, value);
  }

  // Handle conditional blocks (Handlebars-style)
  template = template.replace(/{{#if IS_RENT_STABILIZED}}[\s\S]*?{{\/if}}/g, 
    calculation.isRentStabilized ? 
      '\\textbf{Note:} Building is rent stabilized - limited rent increase potential.' : 
      ''
  );

  return template;
}

/**
 * Generate TikZ coordinates for cumulative savings chart
 */
function generateCumulativeSavingsCoordinates(data: CumulativeSavingsData[] | null): string {
  if (!data || !Array.isArray(data)) return '';
  
  return data
    .slice(0, 15) // Show 15 years to match loan term
    .map((item: CumulativeSavingsData) => `(${item.year},${item.cumulativeSavings})`)
    .join(' ');
}

/**
 * Generate TikZ coordinates for loan balance chart
 */
function generateLoanBalanceCoordinates(data: LoanBalanceData[] | null): string {
  if (!data || !Array.isArray(data)) return '';
  
  return data
    .slice(0, 16) // 15-year loan + 1 extra year
    .map((item: LoanBalanceData) => `(${item.year},${item.balance})`)
    .join(' ');
}

/**
 * Generate TikZ coordinates for property value charts
 */
function generatePropertyValueCoordinates(data: PropertyValueYearData[] | null): string {
  if (!data || !Array.isArray(data)) return '';
  
  return data
    .slice(0, 10) // First 10 years
    .map((item: PropertyValueYearData) => `(${item.year},${(item.value / 1000000).toFixed(1)})`)
    .join(' ');
}

/**
 * Generate TikZ coordinates for NOI charts
 */
function generateNOICoordinates(data: NOIYearData[] | null): string {
  if (!data || !Array.isArray(data)) return '';
  
  return data
    .map((item: NOIYearData) => `(${item.year},${(item.noi / 1000000).toFixed(1)})`)
    .join(' ');
}

/**
 * Generate NOI data table for auditing
 */
function generateNOIDataTable(noiNoUpgrade: NOIYearData[] | null, noiWithUpgrade: NOIYearData[] | null): string {
  if (!noiNoUpgrade || !noiWithUpgrade || !Array.isArray(noiNoUpgrade) || !Array.isArray(noiWithUpgrade)) {
    return '';
  }

  const rows: string[] = [];
  const maxLength = Math.max(noiNoUpgrade.length, noiWithUpgrade.length);
  
  for (let i = 0; i < maxLength; i++) { // Show all years, not just first 10
    const noUpgrade = noiNoUpgrade[i] || { year: 2024 + i, noi: 0 };
    const withUpgrade = noiWithUpgrade[i] || { year: 2024 + i, noi: 0 };
    
    const year = noUpgrade.year || withUpgrade.year;
    const noiWith = withUpgrade.noi.toLocaleString('en-US');
    const noiWithout = noUpgrade.noi.toLocaleString('en-US');
    
    rows.push(`${year} & \\$${noiWith} & \\$${noiWithout} \\\\`);
  }
  
  return rows.join('\n');
}

/**
 * Generate Property Value data table for auditing
 */
function generatePropertyValueDataTable(pvNoUpgrade: PropertyValueYearData[] | null, pvWithUpgrade: PropertyValueYearData[] | null): string {
  if (!pvNoUpgrade || !pvWithUpgrade || !Array.isArray(pvNoUpgrade) || !Array.isArray(pvWithUpgrade)) {
    return '';
  }

  const rows: string[] = [];
  const maxLength = Math.max(pvNoUpgrade.length, pvWithUpgrade.length);
  
  for (let i = 0; i < maxLength; i++) { // Show all years, not just first 10
    const noUpgrade = pvNoUpgrade[i] || { year: 2024 + i, value: 0 };
    const withUpgrade = pvWithUpgrade[i] || { year: 2024 + i, value: 0 };
    
    const year = noUpgrade.year || withUpgrade.year;
    const valueWith = withUpgrade.value.toLocaleString('en-US');
    const valueWithout = noUpgrade.value.toLocaleString('en-US');
    
    rows.push(`${year} & \\$${valueWith} & \\$${valueWithout} \\\\`);
  }
  
  return rows.join('\n');
}

/**
 * Generate Cumulative Savings data table for auditing
 */
function generateCumulativeSavingsDataTable(cumulativeSavingsData: CumulativeSavingsData[] | null, loanBalanceData: LoanBalanceData[] | null): string {
  if (!cumulativeSavingsData || !Array.isArray(cumulativeSavingsData)) {
    return '';
  }

  const rows: string[] = [];
  const maxLength = Math.min(cumulativeSavingsData.length, 15); // Show 15 years to match chart
  
  for (let i = 0; i < maxLength; i++) {
    const savings = cumulativeSavingsData[i] || { year: 2024 + i, cumulativeSavings: 0, annualSavings: 0 };
    const loanBalance = loanBalanceData && loanBalanceData[i] ? loanBalanceData[i].balance : 0;
    
    const year = savings.year;
    const annualSavingsFormatted = savings.annualSavings ? savings.annualSavings.toLocaleString('en-US') : '0';
    const cumulativeSavingsFormatted = savings.cumulativeSavings.toLocaleString('en-US');
    const loanBalanceFormatted = loanBalance.toLocaleString('en-US');
    
    rows.push(`${year} & \\$${annualSavingsFormatted} & \\$${cumulativeSavingsFormatted} & \\$${loanBalanceFormatted} \\\\`);
  }
  
  return rows.join('\n');
}

/**
 * Calculate dynamic scaling for all charts
 */
function calculateChartScales(calculation: CalculationData) {
  // NOI scaling
  const noiData = [...(calculation.noiByYearNoUpgrade || []), ...(calculation.noiByYearWithUpgrade || [])];
  const noiValues = noiData.map(d => d.noi).filter(v => v !== null && v !== undefined);
  const noiMin = Math.min(...noiValues) * 0.95 / 1000000; // Convert to millions with 5% padding
  const noiMax = Math.max(...noiValues) * 1.05 / 1000000;

  // Property value scaling
  const pvData = [...(calculation.propertyValueByYearNoUpgrade || []), ...(calculation.propertyValueByYearWithUpgrade || [])];
  const pvValues = pvData.map(d => d.value).filter(v => v !== null && v !== undefined);
  const pvMin = Math.min(...pvValues) * 0.95 / 1000000; // Convert to millions with 5% padding
  const pvMax = Math.max(...pvValues) * 1.05 / 1000000;

  // Loan chart scaling
  const loanPrincipal = calculation.totalRetrofitCost || 0;
  const cumulativeSavings = calculation.cumulativeSavingsByYear || [];
  const maxSavings = cumulativeSavings.length > 0 
    ? Math.max(...cumulativeSavings.map((s: CumulativeSavingsData) => s.cumulativeSavings || 0))
    : 0;
  const loanBalanceData = calculation.loanBalanceByYear || [];
  const maxLoanBalance = loanBalanceData.length > 0 
    ? Math.max(...loanBalanceData.map((l: LoanBalanceData) => l.balance || 0))
    : loanPrincipal;
  
  const loanChartMax = Math.max(maxLoanBalance, maxSavings) * 1.3; // 30% padding to prevent cutoff

  return {
    noiYMin: noiMin.toFixed(1),
    noiYMax: noiMax.toFixed(1),
    propertyValueYMin: pvMin.toFixed(1),
    propertyValueYMax: pvMax.toFixed(1),
    propertyValueGapYMin: (pvMin + (pvMax - pvMin) * 0.2).toFixed(1),
    propertyValueGapYMax: (pvMin + (pvMax - pvMin) * 0.8).toFixed(1),
    propertyValueGapCenter: ((pvMin + pvMax) / 2).toFixed(1),
    propertyValueGapLabel: ((pvMin + pvMax) / 2 - 1).toFixed(1),
    loanChartYMin: '0',
    loanChartYMax: Math.round(loanChartMax).toString(),
    loanChartAnnotationY: Math.round(loanChartMax * 0.7).toString(),
    loanChartLabelY: Math.round(loanChartMax * 0.9).toString()
  };
}