import { NextRequest, NextResponse } from 'next/server';
import { financialCalculationService } from '@/lib/calculations/services/financial-calculation.service';
import { calculationDependencyManager } from '@/lib/calculations/services/calculation-dependency-manager';
import { FinancialCalculationOverrides } from '@/lib/calculations/types';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/app/api/auth/middleware';

/**
 * @swagger
 * /api/calculations/{id}/financial:
 *   get:
 *     tags:
 *       - Financial Analysis
 *     summary: Get financial analysis and ROI calculations
 *     description: |
 *       Retrieves comprehensive financial analysis for PTAC to PTHP retrofit investment.
 *       This endpoint provides detailed financial metrics including:
 *       
 *       **Investment Analysis:**
 *       - Total retrofit cost breakdown
 *       - Annual energy cost savings projections
 *       - Simple payback period calculations
 *       - Return on investment metrics
 *       
 *       **Financial Performance Metrics:**
 *       - Net Present Value (NPV) calculations for 10-year period
 *       - Internal Rate of Return (IRR) analysis
 *       - Cash flow projections
 *       - Profitability assessments
 *       
 *       **Cost-Benefit Analysis:**
 *       - Initial capital investment vs. long-term savings
 *       - Energy cost reduction benefits
 *       - LL97 fee avoidance savings integration
 *       - Total cost of ownership analysis
 *       
 *       **Prerequisites:** Energy and LL97 calculation services must be executed first as financial depends on their data.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique calculation identifier
 *         example: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *     responses:
 *       200:
 *         description: Financial analysis data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialCalculationData'
 *             examples:
 *               manhattan_residential:
 *                 summary: Manhattan residential financial analysis
 *                 value:
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *                   lastCalculated: "2024-01-15T10:30:00.000Z"
 *                   serviceVersion: "1.0.0"
 *                   totalRetrofitCost: 68200.00
 *                   annualEnergySavings: 31642.86
 *                   simplePaybackPeriod: 2.15
 *                   npv10Year: 185640.50
 *                   irr10Year: 42.8
 *               brooklyn_multifamily:
 *                 summary: Brooklyn multi-family financial analysis
 *                 value:
 *                   calculationId: "b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7"
 *                   lastCalculated: "2024-01-15T11:15:00.000Z"
 *                   serviceVersion: "1.0.0"
 *                   totalRetrofitCost: 125400.00
 *                   annualEnergySavings: 48750.25
 *                   simplePaybackPeriod: 2.57
 *                   npv10Year: 256890.75
 *                   irr10Year: 36.2
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Calculation not found or financial service not yet executed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *             examples:
 *               calculation_not_found:
 *                 summary: Calculation not found
 *                 value:
 *                   error: "Calculation not found"
 *               service_not_executed:
 *                 summary: Financial service not yet executed
 *                 value:
 *                   error: "Financial calculation not yet executed"
 *                   message: "Run the full calculation first or execute the financial service"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 *   put:
 *     tags:
 *       - Financial Analysis
 *     summary: Update financial calculation with overrides
 *     description: |
 *       Updates financial calculations with custom override values and triggers dependent services.
 *       This endpoint allows you to override specific financial calculation parameters and automatically
 *       recalculates dependent services (NOI, Property Value) with cascading updates.
 *       
 *       **Available Overrides:**
 *       - Custom discount rate for NPV calculations
 *       - Alternative financing terms and interest rates
 *       - Tax incentive and rebate adjustments
 *       - Custom maintenance cost factors
 *       - Installation cost overrides
 *       
 *       **Validation:** All overrides are validated for financial reasonableness.
 *       Invalid values will return a 400 error with detailed validation messages.
 *       
 *       **Service Cascading:** After successful financial calculation update, dependent services
 *       (NOI, Property Value) are automatically updated with the new financial projections.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique calculation identifier
 *         example: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customDiscountRate:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Override for discount rate used in NPV calculations (%)
 *                 example: 8.5
 *               customInstallationCostPerUnit:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Override for installation cost per PTHP unit (USD)
 *                 example: 8500.0
 *               taxIncentiveAmount:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Additional tax incentive or rebate amount (USD)
 *                 example: 15000.0
 *               customMaintenanceCostFactor:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Maintenance cost multiplier factor
 *                 example: 1.2
 *           examples:
 *             discount_rate_override:
 *               summary: Override discount rate for conservative analysis
 *               value:
 *                 customDiscountRate: 10.0
 *             installation_cost_override:
 *               summary: Override installation costs
 *               value:
 *                 customInstallationCostPerUnit: 9200.0
 *             tax_incentive_addition:
 *               summary: Add tax incentive to analysis
 *               value:
 *                 taxIncentiveAmount: 25000.0
 *             multiple_overrides:
 *               summary: Multiple financial parameter overrides
 *               value:
 *                 customDiscountRate: 7.5
 *                 customInstallationCostPerUnit: 8800.0
 *                 taxIncentiveAmount: 18000.0
 *                 customMaintenanceCostFactor: 1.1
 *     responses:
 *       200:
 *         description: Financial calculation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceExecutionResponse'
 *             examples:
 *               success:
 *                 summary: Successful update
 *                 value:
 *                   message: "Financial calculation updated successfully"
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *               success_with_warnings:
 *                 summary: Update with validation warnings
 *                 value:
 *                   message: "Financial calculation updated successfully"
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *                   warnings: ["Discount rate is unusually high for current market conditions"]
 *       400:
 *         description: Validation failed - Invalid override values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                 warnings:
 *                   type: array
 *                   items:
 *                     type: string
 *             example:
 *               error: "Validation failed"
 *               details: ["Discount rate must be between 0 and 50%", "Installation cost must be positive"]
 *               warnings: ["Tax incentive amount seems unusually high"]
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Calculation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Calculation not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *             example:
 *               error: "Internal server error"
 *               message: "Failed to execute financial calculation service"
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: calculationId } = await params;

    // Verify user has access to this calculation
    const userCalculation = await prisma.userCalculations.findFirst({
      where: {
        userId: user.userId,
        calculationId,
      },
      include: { calculation: true },
    });

    if (!userCalculation) {
      return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });
    }

    // Check if financial service has been executed
    const serviceVersions = userCalculation.calculation.serviceVersions as Record<string, string> || {};
    if (!serviceVersions.financial) {
      return NextResponse.json({ 
        error: 'Financial calculation not yet executed',
        message: 'Run the full calculation first or execute the financial service'
      }, { status: 404 });
    }

    // Return financial-specific fields from the calculation
    const financialData = {
      calculationId,
      lastCalculated: userCalculation.calculation.updatedAt,
      serviceVersion: serviceVersions.financial,

      // LL97 Fee Avoidance
      annualLL97FeeAvoidance2024to2027: userCalculation.calculation.annualLL97FeeAvoidance2024to2027,
      annualLL97FeeAvoidance2027to2029: userCalculation.calculation.annualLL97FeeAvoidance2027to2029,
      annualLL97FeeAvoidance2030to2034: userCalculation.calculation.annualLL97FeeAvoidance2030to2034,
      annualLL97FeeAvoidance2035to2039: userCalculation.calculation.annualLL97FeeAvoidance2035to2039,
      annualLL97FeeAvoidance2040to2049: userCalculation.calculation.annualLL97FeeAvoidance2040to2049,

      // Payback analysis
      simplePaybackPeriod: userCalculation.calculation.simplePaybackPeriod,
      cumulativeSavingsByYear: userCalculation.calculation.cumulativeSavingsByYear,

      // Loan analysis
      loanBalanceByYear: userCalculation.calculation.loanBalanceByYear,
      monthlyPayment: userCalculation.calculation.monthlyPayment,
      totalInterestPaid: userCalculation.calculation.totalInterestPaid,

      // Summary metrics would be included if stored in database
      // totalSavingsOverAnalysisPeriod: userCalculation.calculation.totalSavingsOverAnalysisPeriod,
      // averageAnnualSavings: userCalculation.calculation.averageAnnualSavings,
      // netPresentValue: userCalculation.calculation.netPresentValue,
      // returnOnInvestment: userCalculation.calculation.returnOnInvestment,
    };

    return NextResponse.json(financialData);
  } catch (error) {
    console.error('Error fetching financial calculation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: calculationId } = await params;

    // Verify user has access to this calculation
    const userCalculation = await prisma.userCalculations.findFirst({
      where: {
        userId: user.userId,
        calculationId,
      },
    });

    if (!userCalculation) {
      return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });
    }

    // Parse request body for overrides
    const overrides: FinancialCalculationOverrides = await request.json();

    // Validate overrides
    const calculation = await prisma.calculations.findUnique({
      where: { id: calculationId },
    });

    if (!calculation) {
      return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });
    }

    const input = financialCalculationService.buildInputFromCalculation(calculation, overrides);
    const validationResult = financialCalculationService.validateInput(input);

    if (!validationResult.valid) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validationResult.errors,
        warnings: validationResult.warnings
      }, { status: 400 });
    }

    // Execute financial service with overrides and cascade to dependent services
    await calculationDependencyManager.executeService(
      calculationId,
      'financial',
      overrides as Record<string, string | number>,
      true // Enable cascading
    );

    return NextResponse.json({ 
      message: 'Financial calculation updated successfully',
      calculationId,
      warnings: validationResult.warnings?.length ? validationResult.warnings : undefined
    });
  } catch (error) {
    console.error('Error updating financial calculation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
