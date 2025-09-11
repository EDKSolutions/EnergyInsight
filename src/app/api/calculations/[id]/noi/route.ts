import { NextRequest, NextResponse } from 'next/server';
import { noiCalculationService } from '@/lib/calculations/services/noi-calculation.service';
import { calculationDependencyManager } from '@/lib/calculations/services/calculation-dependency-manager';
import { NOICalculationOverrides } from '@/lib/calculations/types';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/app/api/auth/middleware';

/**
 * @swagger
 * /api/calculations/{id}/noi:
 *   get:
 *     tags:
 *       - NOI Analysis
 *     summary: Get Net Operating Income analysis
 *     description: |
 *       Retrieves Net Operating Income (NOI) impact analysis for PTAC to PTHP retrofit.
 *       This endpoint provides detailed NOI analysis including:
 *       
 *       **Current NOI Analysis:**
 *       - Current building Net Operating Income from rental calculations or API data
 *       - Methodology used (Cooperative API, Condominium API, or Rental calculation)
 *       - Baseline income and expense projections
 *       
 *       **Energy Savings Impact:**
 *       - Projected NOI increase from reduced energy costs
 *       - Rental income potential from energy savings
 *       - Utility cost pass-through analysis
 *       
 *       **Income Enhancement Potential:**
 *       - Energy efficiency as a value-add amenity
 *       - Rental premium opportunities from green improvements
 *       - Long-term income stability benefits
 *       
 *       **Prerequisites:** LL97 and Financial calculation services must be executed first as NOI depends on their data.
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
 *         description: NOI analysis data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NOICalculationData'
 *             examples:
 *               manhattan_rental:
 *                 summary: Manhattan rental building NOI analysis
 *                 value:
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *                   lastCalculated: "2024-01-15T10:30:00.000Z"
 *                   serviceVersion: "1.0.0"
 *                   currentNOI: 425000.00
 *                   projectedNOIIncrease: 31642.86
 *                   noiCalculationMethod: "rental_calculation"
 *               brooklyn_coop:
 *                 summary: Brooklyn cooperative NOI from API data
 *                 value:
 *                   calculationId: "b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7"
 *                   lastCalculated: "2024-01-15T11:15:00.000Z"
 *                   serviceVersion: "1.0.0"
 *                   currentNOI: 580000.00
 *                   projectedNOIIncrease: 48750.25
 *                   noiCalculationMethod: "coop_api"
 *               queens_condo:
 *                 summary: Queens condominium NOI from API data
 *                 value:
 *                   calculationId: "c3d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8"
 *                   lastCalculated: "2024-01-15T12:00:00.000Z"
 *                   serviceVersion: "1.0.0"
 *                   currentNOI: 325000.00
 *                   projectedNOIIncrease: 28950.00
 *                   noiCalculationMethod: "condo_api"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Calculation not found or NOI service not yet executed
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
 *                 summary: NOI service not yet executed
 *                 value:
 *                   error: "NOI calculation not yet executed"
 *                   message: "Run the full calculation first or execute the NOI service"
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
 *       - NOI Analysis
 *     summary: Update NOI calculation with overrides
 *     description: |
 *       Updates Net Operating Income calculations with custom override values and triggers dependent services.
 *       This endpoint allows you to override specific NOI calculation parameters and automatically
 *       recalculates dependent services (Property Value) with cascading updates.
 *       
 *       **Available Overrides:**
 *       - Custom current NOI value (overrides API or calculated values)
 *       - Rental rate adjustments for energy efficiency premiums
 *       - Vacancy rate assumptions
 *       - Operating expense ratios
 *       - Utility cost allocation factors
 *       
 *       **Validation:** All overrides are validated for market reasonableness.
 *       Invalid values will return a 400 error with detailed validation messages.
 *       
 *       **Service Cascading:** After successful NOI calculation update, dependent services
 *       (Property Value) are automatically updated with the new income projections.
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
 *               customCurrentNOI:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Override for current NOI value (USD)
 *                 example: 450000.0
 *               energyEfficiencyRentalPremium:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Additional rental premium for energy efficiency (% of base rent)
 *                 example: 2.5
 *               customVacancyRate:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Override vacancy rate assumption (%)
 *                 example: 5.0
 *               customOperatingExpenseRatio:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Operating expense ratio override (% of gross income)
 *                 example: 55.0
 *           examples:
 *             custom_noi_override:
 *               summary: Override current NOI with custom value
 *               value:
 *                 customCurrentNOI: 485000.0
 *             rental_premium_addition:
 *               summary: Add energy efficiency rental premium
 *               value:
 *                 energyEfficiencyRentalPremium: 3.0
 *             vacancy_adjustment:
 *               summary: Adjust vacancy rate assumptions
 *               value:
 *                 customVacancyRate: 4.5
 *             multiple_overrides:
 *               summary: Multiple NOI parameter overrides
 *               value:
 *                 customCurrentNOI: 470000.0
 *                 energyEfficiencyRentalPremium: 2.8
 *                 customVacancyRate: 5.5
 *                 customOperatingExpenseRatio: 52.0
 *     responses:
 *       200:
 *         description: NOI calculation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceExecutionResponse'
 *             examples:
 *               success:
 *                 summary: Successful update
 *                 value:
 *                   message: "NOI calculation updated successfully"
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *               success_with_warnings:
 *                 summary: Update with validation warnings
 *                 value:
 *                   message: "NOI calculation updated successfully"
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *                   warnings: ["Rental premium assumption is high for this market"]
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
 *               details: ["NOI must be positive", "Vacancy rate must be between 0 and 100%"]
 *               warnings: ["Operating expense ratio seems unusually low"]
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
 *               message: "Failed to execute NOI calculation service"
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

    // Check if NOI service has been executed
    const serviceVersions = userCalculation.calculation.serviceVersions as Record<string, string> || {};
    if (!serviceVersions.noi) {
      return NextResponse.json({ 
        error: 'NOI calculation not yet executed',
        message: 'Run the full calculation first or execute the NOI service'
      }, { status: 404 });
    }

    // Return NOI-specific fields from the calculation
    const noiData = {
      calculationId,
      lastCalculated: userCalculation.calculation.updatedAt,
      serviceVersion: serviceVersions.noi,

      // Base Annual Building NOI
      annualBuildingNOI: userCalculation.calculation.annualBuildingNOI,
      
      // Year-by-year NOI projections
      noiByYearNoUpgrade: userCalculation.calculation.noiByYearNoUpgrade,
      noiByYearWithUpgrade: userCalculation.calculation.noiByYearWithUpgrade,
      
      // Rent stabilization status
      isRentStabilized: userCalculation.calculation.isRentStabilized,
    };

    return NextResponse.json(noiData);
  } catch (error) {
    console.error('Error fetching NOI calculation:', error);
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
    const overrides: NOICalculationOverrides = await request.json();

    // Validate overrides
    const calculation = await prisma.calculations.findUnique({
      where: { id: calculationId },
    });

    if (!calculation) {
      return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });
    }

    const input = noiCalculationService.buildInputFromCalculation(calculation, overrides);
    const validationResult = noiCalculationService.validateInput(input);

    if (!validationResult.valid) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validationResult.errors,
        warnings: validationResult.warnings
      }, { status: 400 });
    }

    // Execute NOI service with overrides and cascade to dependent services
    await calculationDependencyManager.executeService(
      calculationId,
      'noi',
      overrides,
      true // Enable cascading
    );

    return NextResponse.json({ 
      message: 'NOI calculation updated successfully',
      calculationId,
      warnings: validationResult.warnings?.length ? validationResult.warnings : undefined
    });
  } catch (error) {
    console.error('Error updating NOI calculation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}