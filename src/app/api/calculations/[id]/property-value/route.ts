import { NextRequest, NextResponse } from 'next/server';
import { propertyValueCalculationService } from '@/lib/calculations/services/property-value-calculation.service';
import { calculationDependencyManager } from '@/lib/calculations/services/calculation-dependency-manager';
import { PropertyValueCalculationOverrides } from '@/lib/calculations/types';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/app/api/auth/middleware';

/**
 * @swagger
 * /api/calculations/{id}/property-value:
 *   get:
 *     tags:
 *       - Property Value Analysis
 *     summary: Get property value impact analysis
 *     description: |
 *       Retrieves property value impact analysis for PTAC to PTHP retrofit investment.
 *       This endpoint provides comprehensive property valuation data including:
 *       
 *       **Current Property Value:**
 *       - Current market value baseline assessment
 *       - Capitalization rate analysis
 *       - Comparable property benchmarking
 *       
 *       **Value Enhancement Analysis:**
 *       - NOI-based value increase from improved cash flows
 *       - Green building premium from energy efficiency improvements
 *       - Market positioning benefits from sustainability features
 *       
 *       **Investment Return Analysis:**
 *       - Total property value increase from retrofit
 *       - ROI on retrofit investment through property appreciation
 *       - Long-term value preservation benefits
 *       
 *       **Prerequisites:** All other calculation services (Energy, LL97, Financial, NOI) must be executed first as property value analysis is the final step in the dependency chain.
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
 *         description: Property value analysis data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertyValueCalculationData'
 *             examples:
 *               manhattan_residential:
 *                 summary: Manhattan residential property value analysis
 *                 value:
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *                   lastCalculated: "2024-01-15T10:30:00.000Z"
 *                   serviceVersion: "1.0.0"
 *                   currentPropertyValue: 2850000.00
 *                   propertyValueIncrease: 575428.00
 *                   capRate: 5.5
 *               brooklyn_multifamily:
 *                 summary: Brooklyn multi-family property value analysis
 *                 value:
 *                   calculationId: "b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7"
 *                   lastCalculated: "2024-01-15T11:15:00.000Z"
 *                   serviceVersion: "1.0.0"
 *                   currentPropertyValue: 4250000.00
 *                   propertyValueIncrease: 886820.50
 *                   capRate: 6.2
 *               queens_apartment:
 *                 summary: Queens apartment building value analysis
 *                 value:
 *                   calculationId: "c3d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8"
 *                   lastCalculated: "2024-01-15T12:00:00.000Z"
 *                   serviceVersion: "1.0.0"
 *                   currentPropertyValue: 1950000.00
 *                   propertyValueIncrease: 468900.00
 *                   capRate: 6.8
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Calculation not found or property value service not yet executed
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
 *                 summary: Property value service not yet executed
 *                 value:
 *                   error: "Property value calculation not yet executed"
 *                   message: "Run the full calculation first or execute the property value service"
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
 *       - Property Value Analysis
 *     summary: Update property value calculation with overrides
 *     description: |
 *       Updates property value calculations with custom override values. This is the final service in the
 *       dependency chain, so no other services are cascaded after property value updates.
 *       
 *       **Available Overrides:**
 *       - Custom capitalization rate for value calculations
 *       - Green building premium percentage adjustments
 *       - Market condition multipliers
 *       - Comparable property value benchmarks
 *       - Value appreciation rate assumptions
 *       
 *       **Validation:** All overrides are validated for market reasonableness and industry standards.
 *       Invalid values will return a 400 error with detailed validation messages.
 *       
 *       **No Service Cascading:** Property value is the final service in the dependency chain,
 *       so no other services are triggered after property value calculations.
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
 *               customCapRate:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Override for capitalization rate (%)
 *                 example: 6.5
 *               customGreenBuildingPremium:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Green building premium percentage (%)
 *                 example: 8.5
 *               customCurrentPropertyValue:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Override for current property value baseline (USD)
 *                 example: 3200000.0
 *               marketConditionMultiplier:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Market condition adjustment multiplier
 *                 example: 1.15
 *           examples:
 *             cap_rate_override:
 *               summary: Override capitalization rate
 *               value:
 *                 customCapRate: 7.0
 *             green_premium_override:
 *               summary: Adjust green building premium
 *               value:
 *                 customGreenBuildingPremium: 10.0
 *             property_value_override:
 *               summary: Override baseline property value
 *               value:
 *                 customCurrentPropertyValue: 3500000.0
 *             multiple_overrides:
 *               summary: Multiple property value parameter overrides
 *               value:
 *                 customCapRate: 6.8
 *                 customGreenBuildingPremium: 9.2
 *                 customCurrentPropertyValue: 3100000.0
 *                 marketConditionMultiplier: 1.12
 *     responses:
 *       200:
 *         description: Property value calculation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceExecutionResponse'
 *             examples:
 *               success:
 *                 summary: Successful update
 *                 value:
 *                   message: "Property value calculation updated successfully"
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *               success_with_warnings:
 *                 summary: Update with validation warnings
 *                 value:
 *                   message: "Property value calculation updated successfully"
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *                   warnings: ["Cap rate is unusually low for this market area"]
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
 *               details: ["Cap rate must be between 1% and 20%", "Property value must be positive"]
 *               warnings: ["Green building premium seems unusually high for this market"]
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
 *               message: "Failed to execute property value calculation service"
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

    // Check if property value service has been executed
    const serviceVersions = userCalculation.calculation.serviceVersions as Record<string, string> || {};
    if (!serviceVersions['property-value']) {
      return NextResponse.json({ 
        error: 'Property value calculation not yet executed',
        message: 'Run the full calculation first or execute the property value service'
      }, { status: 404 });
    }

    // Return property value-specific fields from the calculation
    const propertyValueData = {
      calculationId,
      lastCalculated: userCalculation.calculation.updatedAt,
      serviceVersion: serviceVersions['property-value'],

      // Summary property values
      propertyValueNoUpgrade: userCalculation.calculation.propertyValueNoUpgrade,
      propertyValueWithUpgrade: userCalculation.calculation.propertyValueWithUpgrade,
      netPropertyValueGain: userCalculation.calculation.netPropertyValueGain,

      // Year-by-year property value projections
      propertyValueByYearNoUpgrade: userCalculation.calculation.propertyValueByYearNoUpgrade,
      propertyValueByYearWithUpgrade: userCalculation.calculation.propertyValueByYearWithUpgrade,
    };

    return NextResponse.json(propertyValueData);
  } catch (error) {
    console.error('Error fetching property value calculation:', error);
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
    const overrides: PropertyValueCalculationOverrides = await request.json();

    // Validate overrides
    const calculation = await prisma.calculations.findUnique({
      where: { id: calculationId },
    });

    if (!calculation) {
      return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });
    }

    const input = propertyValueCalculationService.buildInputFromCalculation(calculation, overrides);
    const validationResult = propertyValueCalculationService.validateInput(input);

    if (!validationResult.valid) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validationResult.errors,
        warnings: validationResult.warnings
      }, { status: 400 });
    }

    // Execute property value service with overrides (no cascading needed - this is the last service)
    await calculationDependencyManager.executeService(
      calculationId,
      'property-value',
      overrides,
      false // No cascading - this is the final service in the chain
    );

    return NextResponse.json({ 
      message: 'Property value calculation updated successfully',
      calculationId,
      warnings: validationResult.warnings?.length ? validationResult.warnings : undefined
    });
  } catch (error) {
    console.error('Error updating property value calculation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}