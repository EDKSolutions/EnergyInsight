import { NextRequest, NextResponse } from 'next/server';
import { ll97CalculationService } from '@/lib/calculations/services/ll97-calculation.service';
import { calculationDependencyManager } from '@/lib/calculations/services/calculation-dependency-manager';
import { LL97CalculationOverrides } from '@/lib/calculations/types';
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