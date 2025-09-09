import { NextRequest, NextResponse } from 'next/server';
import { noiCalculationService } from '@/lib/calculations/services/noi-calculation.service';
import { calculationDependencyManager } from '@/lib/calculations/services/calculation-dependency-manager';
import { NOICalculationOverrides } from '@/lib/calculations/types';
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

      // Rental income impact
      potentialRentalIncomeImpact: userCalculation.calculation.potentialRentalIncomeImpact,
      utilitiesIncludedInRent: userCalculation.calculation.utilitiesIncludedInRent,
      rentIncreasePercentage: userCalculation.calculation.rentIncreasePercentage,

      // Operating expense savings
      operatingExpenseSavings: userCalculation.calculation.operatingExpenseSavings,

      // NOI calculations
      noiImpact: userCalculation.calculation.noiImpact,
      effectiveGrossIncomeChange: userCalculation.calculation.effectiveGrossIncomeChange,
      netOperatingIncomeChange: userCalculation.calculation.netOperatingIncomeChange,

      // NOI metrics
      estimatedCurrentNOI: userCalculation.calculation.estimatedCurrentNOI,
      newNOI: userCalculation.calculation.newNOI,
      noiYieldOnInvestment: userCalculation.calculation.noiYieldOnInvestment,
      roiFromNOI: userCalculation.calculation.roiFromNOI,
      noiPaybackPeriod: userCalculation.calculation.noiPaybackPeriod,
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