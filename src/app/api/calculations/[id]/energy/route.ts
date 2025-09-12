import { NextRequest, NextResponse } from 'next/server';
import { energyCalculationService } from '@/lib/calculations/services/energy-calculation.service';
import { calculationDependencyManager } from '@/lib/calculations/services/calculation-dependency-manager';
import { EnergyCalculationOverrides } from '@/lib/calculations/types';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/app/api/auth/middleware';

/**
 * @swagger
 * /api/calculations/{id}/energy:
 *   get:
 *     tags:
 *       - Energy Calculations
 *     summary: Get energy calculation results
 *     description: |
 *       Retrieves detailed energy consumption and savings analysis for a specific calculation.
 *       This endpoint provides comprehensive energy data including:
 *       
 *       **PTAC System Analysis:**
 *       - Annual energy consumption (heating/cooling) in MMBtu
 *       - Electricity and gas usage breakdown
 *       - Operating costs analysis
 *       
 *       **PTHP System Projections:**
 *       - Projected energy consumption after conversion
 *       - Energy reduction calculations
 *       - Cost savings projections
 *       
 *       **Energy Efficiency Metrics:**
 *       - EFLH (Equivalent Full Load Hours) calculations
 *       - Energy reduction percentage
 *       - Annual energy savings in USD
 *       
 *       **Prerequisites:** The energy calculation service must have been executed for this calculation.
 *       Use the `/execute` endpoint to run calculations if not yet completed.
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
 *         description: Energy calculation data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnergyCalculationData'
 *             examples:
 *               manhattan_residential:
 *                 summary: Manhattan residential building energy analysis
 *                 value:
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *                   lastCalculated: "2024-01-15T10:30:00.000Z"
 *                   serviceVersion: "1.0.0"
 *                   eflhHours: 2876.5
 *                   annualBuildingMMBtuCoolingPTAC: 1234.56
 *                   annualBuildingMMBtuHeatingPTAC: 2550.00
 *                   annualBuildingMMBtuTotalPTAC: 3784.56
 *                   annualBuildingMMBtuHeatingPTHP: 1200.50
 *                   annualBuildingMMBtuCoolingPTHP: 1234.56
 *                   annualBuildingMMBtuTotalPTHP: 2435.06
 *                   energyReductionPercentage: 35.67
 *                   totalRetrofitCost: 68200.00
 *                   annualEnergySavings: 31642.86
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Calculation not found or energy service not yet executed
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
 *                 summary: Energy service not yet executed
 *                 value:
 *                   error: "Energy calculation not yet executed"
 *                   message: "Run the full calculation first or execute the energy service"
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
 *       - Energy Calculations
 *     summary: Update energy calculation with overrides
 *     description: |
 *       Updates energy calculations with custom override values and triggers dependent services.
 *       This endpoint allows you to override specific energy calculation parameters and automatically
 *       recalculates dependent services (LL97, Financial, NOI, Property Value) with cascading updates.
 *       
 *       **Available Overrides:**
 *       - Site EUI (Energy Use Intensity)
 *       - Number of PTAC units
 *       - Electricity cost per kWh
 *       - Gas cost per therm
 *       
 *       **Validation:** All overrides are validated before execution. Invalid values will return
 *       a 400 error with detailed validation messages.
 *       
 *       **Service Cascading:** After successful energy calculation update, dependent services
 *       (LL97, Financial, NOI, Property Value) are automatically updated with the new values.
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
 *             $ref: '#/components/schemas/EnergyCalculationOverrides'
 *           examples:
 *             site_eui_override:
 *               summary: Override Site EUI value
 *               value:
 *                 siteEUI: 75.5
 *             ptac_units_override:
 *               summary: Override number of PTAC units
 *               value:
 *                 ptacUnits: 12
 *             energy_costs_override:
 *               summary: Override energy costs
 *               value:
 *                 electricityCost: 0.25
 *                 gasCost: 1.85
 *             multiple_overrides:
 *               summary: Multiple parameter overrides
 *               value:
 *                 siteEUI: 80.0
 *                 ptacUnits: 10
 *                 electricityCost: 0.22
 *                 gasCost: 1.75
 *     responses:
 *       200:
 *         description: Energy calculation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceExecutionResponse'
 *             examples:
 *               success:
 *                 summary: Successful update
 *                 value:
 *                   message: "Energy calculation updated successfully"
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *               success_with_warnings:
 *                 summary: Update with validation warnings
 *                 value:
 *                   message: "Energy calculation updated successfully"
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *                   warnings: ["Site EUI value is unusually high for this building type"]
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
 *               details: ["Site EUI must be a positive number", "PTAC units must be greater than 0"]
 *               warnings: ["Electricity cost seems unusually high"]
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
 *               message: "Failed to execute energy calculation service"
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

    // Check if energy service has been executed
    const serviceVersions = userCalculation.calculation.serviceVersions as Record<string, string> || {};
    if (!serviceVersions.energy) {
      return NextResponse.json({ 
        error: 'Energy calculation not yet executed',
        message: 'Run the full calculation first or execute the energy service'
      }, { status: 404 });
    }

    // Return energy-specific fields from the calculation
    const energyData = {
      calculationId,
      lastCalculated: userCalculation.calculation.updatedAt,
      serviceVersion: serviceVersions.energy,

      // EFLH calculation
      eflhHours: userCalculation.calculation.eflhHours,
      
      // Section 2.2 - PTAC calculations
      annualBuildingMMBtuCoolingPTAC: userCalculation.calculation.annualBuildingMMBtuCoolingPTAC,
      annualBuildingMMBtuHeatingPTAC: userCalculation.calculation.annualBuildingMMBtuHeatingPTAC,
      annualBuildingMMBtuTotalPTAC: userCalculation.calculation.annualBuildingMMBtuTotalPTAC,
      annualBuildingThermsHeatingPTAC: userCalculation.calculation.annualBuildingThermsHeatingPTAC,
      annualBuildingKwhCoolingPTAC: userCalculation.calculation.annualBuildingkWhCoolingPTAC,
      annualBuildingCostPTAC: userCalculation.calculation.annualBuildingCostPTAC,

      // Section 3 - PTHP calculations
      annualBuildingkWhHeatingPTHP: userCalculation.calculation.annualBuildingkWhHeatingPTHP,
      annualBuildingMMBtuHeatingPTHP: userCalculation.calculation.annualBuildingMMBtuHeatingPTHP,
      annualBuildingMMBtuCoolingPTHP: userCalculation.calculation.annualBuildingMMBtuCoolingPTHP,
      annualBuildingMMBtuTotalPTHP: userCalculation.calculation.annualBuildingMMBtuTotalPTHP,
      annualBuildingKwhCoolingPTHP: userCalculation.calculation.annualBuildingkWhCoolingPTHP,
      annualBuildingCostPTHP: userCalculation.calculation.annualBuildingCostPTHP,

      // Section 4 - Energy reduction analysis
      energyReductionPercentage: userCalculation.calculation.energyReductionPercentage,

      // Section 5 - Retrofit cost calculation
      totalRetrofitCost: userCalculation.calculation.totalRetrofitCost,

      // Section 6 - Energy cost savings
      annualEnergySavings: userCalculation.calculation.annualEnergySavings,
    };

    return NextResponse.json(energyData);
  } catch (error) {
    console.error('Error fetching energy calculation:', error);
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
    const overrides: EnergyCalculationOverrides = await request.json();

    // Validate overrides
    const calculation = await prisma.calculations.findUnique({
      where: { id: calculationId },
    });

    if (!calculation) {
      return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });
    }

    const input = energyCalculationService.buildInputFromCalculation(calculation, overrides);
    const validationResult = energyCalculationService.validateInput(input);

    if (!validationResult.valid) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validationResult.errors,
        warnings: validationResult.warnings
      }, { status: 400 });
    }

    // Execute energy service with overrides and cascade to dependent services
    await calculationDependencyManager.executeService(
      calculationId,
      'energy',
      overrides as Record<string, string | number>,
      true // Enable cascading
    );

    // Get updated calculation
    const updatedCalculation = await prisma.calculations.findUnique({
      where: { id: calculationId },
    });

    if (!updatedCalculation) {
      return NextResponse.json({ error: 'Failed to retrieve updated calculation' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Energy calculation updated successfully',
      calculationId,
      warnings: validationResult.warnings?.length ? validationResult.warnings : undefined
    });
  } catch (error) {
    console.error('Error updating energy calculation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
