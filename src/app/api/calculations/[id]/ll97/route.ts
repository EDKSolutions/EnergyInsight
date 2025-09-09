import { NextRequest, NextResponse } from 'next/server';
import { ll97CalculationService } from '@/lib/calculations/services/ll97-calculation.service';
import { calculationDependencyManager } from '@/lib/calculations/services/calculation-dependency-manager';
import { LL97CalculationOverrides } from '@/lib/calculations/types';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/app/api/auth/middleware';

/**
 * @swagger
 * /api/calculations/{id}/ll97:
 *   get:
 *     tags:
 *       - LL97 Compliance
 *     summary: Get Local Law 97 compliance analysis
 *     description: |
 *       Retrieves Local Law 97 emissions compliance analysis for a specific calculation.
 *       This endpoint provides comprehensive LL97 data including:
 *       
 *       **Emissions Analysis:**
 *       - Current building emission intensity vs. LL97 limits
 *       - Emissions budgets for different compliance periods (2024-2029, 2030+)
 *       - PTAC vs PTHP emissions comparison
 *       
 *       **Fee Avoidance Calculations:**
 *       - Annual fee avoidance for different LL97 periods
 *       - Cost impact of emissions reductions
 *       - Long-term compliance savings
 *       
 *       **Compliance Metrics:**
 *       - Building-specific emissions limits based on occupancy group
 *       - Emission reduction percentages from PTAC to PTHP conversion
 *       - Multi-year compliance projections
 *       
 *       **Prerequisites:** Energy calculation service must be executed first as LL97 depends on energy data.
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
 *         description: LL97 compliance data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LL97CalculationData'
 *             examples:
 *               manhattan_residential:
 *                 summary: Manhattan residential LL97 analysis
 *                 value:
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *                   lastCalculated: "2024-01-15T10:30:00.000Z"
 *                   serviceVersion: "1.0.0"
 *                   currentEmissionIntensity: 12.5
 *                   ll97Limit: 10.2
 *                   annualLL97FeeAvoidance2024to2027: 15750.00
 *                   annualLL97FeeAvoidance2027to2029: 18200.00
 *                   annualLL97FeeAvoidance2030plus: 22500.00
 *               brooklyn_multifamily:
 *                 summary: Brooklyn multi-family LL97 analysis
 *                 value:
 *                   calculationId: "b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7"
 *                   lastCalculated: "2024-01-15T11:15:00.000Z"
 *                   serviceVersion: "1.0.0"
 *                   currentEmissionIntensity: 14.8
 *                   ll97Limit: 11.5
 *                   annualLL97FeeAvoidance2024to2027: 24800.00
 *                   annualLL97FeeAvoidance2027to2029: 28600.00
 *                   annualLL97FeeAvoidance2030plus: 35200.00
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Calculation not found or LL97 service not yet executed
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
 *                 summary: LL97 service not yet executed
 *                 value:
 *                   error: "LL97 calculation not yet executed"
 *                   message: "Run the full calculation first or execute the LL97 service"
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
 *       - LL97 Compliance
 *     summary: Update LL97 calculation with overrides
 *     description: |
 *       Updates Local Law 97 compliance calculations with custom override values and triggers dependent services.
 *       This endpoint allows you to override specific LL97 calculation parameters and automatically
 *       recalculates dependent services (Financial, NOI, Property Value) with cascading updates.
 *       
 *       **Available Overrides:**
 *       - Custom emissions limits (if different from standard LL97 limits)
 *       - Fee rates per ton of CO2 equivalent
 *       - Alternative compliance pathways
 *       - Building-specific emission factors
 *       
 *       **Validation:** All overrides are validated for compliance with LL97 regulations.
 *       Invalid values will return a 400 error with detailed validation messages.
 *       
 *       **Service Cascading:** After successful LL97 calculation update, dependent services
 *       (Financial, NOI, Property Value) are automatically updated with the new compliance costs.
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
 *               customEmissionLimit:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Override for LL97 emission limit (kgCO2e/sqft/year)
 *                 example: 9.5
 *               customFeeRate2024to2027:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Override for LL97 fee rate 2024-2027 period ($/tCO2e)
 *                 example: 268.0
 *               customFeeRate2027to2029:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Override for LL97 fee rate 2027-2029 period ($/tCO2e)
 *                 example: 322.0
 *               customFeeRate2030plus:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Override for LL97 fee rate 2030+ period ($/tCO2e)
 *                 example: 398.0
 *           examples:
 *             emission_limit_override:
 *               summary: Override emission limit for special building
 *               value:
 *                 customEmissionLimit: 8.5
 *             fee_rates_override:
 *               summary: Override LL97 fee rates
 *               value:
 *                 customFeeRate2024to2027: 280.0
 *                 customFeeRate2027to2029: 335.0
 *                 customFeeRate2030plus: 415.0
 *             multiple_overrides:
 *               summary: Multiple LL97 parameter overrides
 *               value:
 *                 customEmissionLimit: 9.2
 *                 customFeeRate2024to2027: 275.0
 *                 customFeeRate2027to2029: 330.0
 *     responses:
 *       200:
 *         description: LL97 calculation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceExecutionResponse'
 *             examples:
 *               success:
 *                 summary: Successful update
 *                 value:
 *                   message: "LL97 calculation updated successfully"
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *               success_with_warnings:
 *                 summary: Update with validation warnings
 *                 value:
 *                   message: "LL97 calculation updated successfully"
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *                   warnings: ["Custom emission limit is lower than standard LL97 requirements"]
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
 *               details: ["Emission limit must be positive", "Fee rate must be greater than 0"]
 *               warnings: ["Custom fee rate is significantly different from LL97 standards"]
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
 *               message: "Failed to execute LL97 calculation service"
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: calculationId } = params;

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

    // Check if LL97 service has been executed
    const serviceVersions = userCalculation.calculation.serviceVersions as Record<string, string> || {};
    if (!serviceVersions.ll97) {
      return NextResponse.json({ 
        error: 'LL97 calculation not yet executed',
        message: 'Run the full calculation first or execute the LL97 service'
      }, { status: 404 });
    }

    // Return LL97-specific fields from the calculation
    const ll97Data = {
      calculationId,
      lastCalculated: userCalculation.calculation.updatedAt,
      serviceVersion: serviceVersions.ll97,

      // Emissions budgets
      emissionsBudget2024to2029: userCalculation.calculation.emissionsBudget2024to2029,
      emissionsBudget2030to2034: userCalculation.calculation.emissionsBudget2030to2034,
      emissionsBudget2035to2039: userCalculation.calculation.emissionsBudget2035to2039,
      emissionsBudget2040to2049: userCalculation.calculation.emissionsBudget2040to2049,

      // Current emissions
      totalBuildingEmissionsLL84: userCalculation.calculation.totalBuildingEmissionsLL84,

      // Current fees
      annualFeeExceedingBudget2024to2029: userCalculation.calculation.annualFeeExceedingBudget2024to2029,
      annualFeeExceedingBudget2030to2034: userCalculation.calculation.annualFeeExceedingBudget2030to2034,
      annualFeeExceedingBudget2035to2039: userCalculation.calculation.annualFeeExceedingBudget2035to2039,
      annualFeeExceedingBudget2040to2049: userCalculation.calculation.annualFeeExceedingBudget2040to2049,

      // BE Credits
      beCreditBefore2027: userCalculation.calculation.beCreditBefore2027,
      beCredit2027to2029: userCalculation.calculation.beCredit2027to2029,

      // Adjusted emissions
      adjustedTotalBuildingEmissions2024to2029: userCalculation.calculation.adjustedTotalBuildingEmissions2024to2029,
      adjustedTotalBuildingEmissions2030to2034: userCalculation.calculation.adjustedTotalBuildingEmissions2030to2034,
      adjustedTotalBuildingEmissions2035to2039: userCalculation.calculation.adjustedTotalBuildingEmissions2035to2039,
      adjustedTotalBuildingEmissions2040to2049: userCalculation.calculation.adjustedTotalBuildingEmissions2040to2049,

      // Adjusted fees
      adjustedAnnualFeeBefore2027: userCalculation.calculation.adjustedAnnualFeeBefore2027,
      adjustedAnnualFee2027to2029: userCalculation.calculation.adjustedAnnualFee2027to2029,
      adjustedAnnualFee2030to2034: userCalculation.calculation.adjustedAnnualFee2030to2034,
      adjustedAnnualFee2035to2039: userCalculation.calculation.adjustedAnnualFee2035to2039,
      adjustedAnnualFee2040to2049: userCalculation.calculation.adjustedAnnualFee2040to2049,
    };

    return NextResponse.json(ll97Data);
  } catch (error) {
    console.error('Error fetching LL97 calculation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: calculationId } = params;

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
    const overrides: LL97CalculationOverrides = await request.json();

    // Validate overrides
    const calculation = await prisma.calculations.findUnique({
      where: { id: calculationId },
    });

    if (!calculation) {
      return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });
    }

    const input = ll97CalculationService.buildInputFromCalculation(calculation, overrides);
    const validationResult = ll97CalculationService.validateInput(input);

    if (!validationResult.valid) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validationResult.errors,
        warnings: validationResult.warnings
      }, { status: 400 });
    }

    // Execute LL97 service with overrides and cascade to dependent services
    await calculationDependencyManager.executeService(
      calculationId,
      'll97',
      overrides,
      true // Enable cascading
    );

    return NextResponse.json({ 
      message: 'LL97 calculation updated successfully',
      calculationId,
      warnings: validationResult.warnings?.length ? validationResult.warnings : undefined
    });
  } catch (error) {
    console.error('Error updating LL97 calculation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}