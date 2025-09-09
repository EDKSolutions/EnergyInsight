import { NextRequest, NextResponse } from 'next/server';
import { energyCalculationService } from '@/lib/calculations/services/energy-calculation.service';
import { calculationDependencyManager } from '@/lib/calculations/services/calculation-dependency-manager';
import { EnergyCalculationOverrides } from '@/lib/calculations/types';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/app/api/auth/middleware';

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
      annualBuildingKwhCoolingPTAC: userCalculation.calculation.annualBuildingKwhCoolingPTAC,
      annualBuildingCostPTAC: userCalculation.calculation.annualBuildingCostPTAC,

      // Section 3 - PTHP calculations
      annualBuildingkWhHeatingPTHP: userCalculation.calculation.annualBuildingkWhHeatingPTHP,
      annualBuildingMMBtuHeatingPTHP: userCalculation.calculation.annualBuildingMMBtuHeatingPTHP,
      annualBuildingMMBtuCoolingPTHP: userCalculation.calculation.annualBuildingMMBtuCoolingPTHP,
      annualBuildingMMBtuTotalPTHP: userCalculation.calculation.annualBuildingMMBtuTotalPTHP,
      annualBuildingKwhCoolingPTHP: userCalculation.calculation.annualBuildingKwhCoolingPTHP,
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
      overrides,
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