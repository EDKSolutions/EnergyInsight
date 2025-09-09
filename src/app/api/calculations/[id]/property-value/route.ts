import { NextRequest, NextResponse } from 'next/server';
import { propertyValueCalculationService } from '@/lib/calculations/services/property-value-calculation.service';
import { calculationDependencyManager } from '@/lib/calculations/services/calculation-dependency-manager';
import { PropertyValueCalculationOverrides } from '@/lib/calculations/types';
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

      // Value increases
      noiBasedValueIncrease: userCalculation.calculation.noiBasedValueIncrease,
      greenPremiumValueIncrease: userCalculation.calculation.greenPremiumValueIncrease,
      energyEfficiencyValueIncrease: userCalculation.calculation.energyEfficiencyValueIncrease,
      totalPropertyValueIncrease: userCalculation.calculation.totalPropertyValueIncrease,

      // Property values
      currentPropertyValue: userCalculation.calculation.buildingValue, // Use buildingValue as current property value
      newPropertyValue: userCalculation.calculation.newPropertyValue,

      // Return metrics
      valueCreationROI: userCalculation.calculation.valueCreationROI,
      propertyAppreciationPercentage: userCalculation.calculation.propertyAppreciationPercentage,
      additionalLoanCapacity: userCalculation.calculation.additionalLoanCapacity,
      netBenefit: userCalculation.calculation.netBenefit,
      valuePaybackPeriod: userCalculation.calculation.valuePaybackPeriod,

      // Financing impact
      refinancingBenefit: userCalculation.calculation.refinancingBenefit,
      dscrImprovement: userCalculation.calculation.dscrImprovement,
      creditworthinessImprovement: userCalculation.calculation.creditworthinessImprovement,
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