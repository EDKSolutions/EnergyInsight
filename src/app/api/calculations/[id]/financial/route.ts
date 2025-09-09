import { NextRequest, NextResponse } from 'next/server';
import { financialCalculationService } from '@/lib/calculations/services/financial-calculation.service';
import { calculationDependencyManager } from '@/lib/calculations/services/calculation-dependency-manager';
import { FinancialCalculationOverrides } from '@/lib/calculations/types';
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
      totalSavingsOverAnalysisPeriod: userCalculation.calculation.totalSavingsOverAnalysisPeriod,
      averageAnnualSavings: userCalculation.calculation.averageAnnualSavings,
      netPresentValue: userCalculation.calculation.netPresentValue,
      returnOnInvestment: userCalculation.calculation.returnOnInvestment,
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
      overrides,
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