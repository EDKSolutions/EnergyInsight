/**
 * @swagger
 * /api/calculations/{id}/financial:
 *   get:
 *     tags:
 *       - Calculations - Financial
 *     summary: Get financial analysis including payback calculations (Section 8)
 *     description: |
 *       Returns comprehensive financial analysis including:
 *       - Simple payback period calculation
 *       - Cumulative savings by year
 *       - LL97 fee avoidance by compliance period
 *       - Loan analysis with amortization
 *       - Visualization data for charts
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Calculation ID
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: loanTermYears
 *         in: query
 *         required: false
 *         description: Loan term in years (default 15)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 30
 *       - name: interestRate
 *         in: query
 *         required: false
 *         description: Annual interest rate as decimal (default 0.06)
 *         schema:
 *           type: number
 *           minimum: 0.01
 *           maximum: 0.20
 *     responses:
 *       200:
 *         description: Financial analysis results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialCalculationResponse'
 *       404:
 *         description: Calculation not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../auth/middleware';
import { calculationOrchestrator } from '@/lib/calculations/orchestrators/calculation-orchestrator';
import { financialCalculationService } from '@/lib/calculations/services/financial-calculations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/calculations/${params.id}/financial`);
    
    // Parse query parameters for financial configuration
    const { searchParams } = new URL(request.url);
    const loanTermYears = parseInt(searchParams.get('loanTermYears') || '15');
    const interestRate = parseFloat(searchParams.get('interestRate') || '0.06');
    
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get calculation data
    const calculation = await calculationOrchestrator.getCalculationData(params.id);
    if (!calculation) {
      return NextResponse.json(
        { error: 'Calculation not found' },
        { status: 404 }
      );
    }
    
    // Validate required data for financial calculations
    if (!calculationOrchestrator.validateEnergyCalculations(params.id, calculation)) {
      return NextResponse.json(
        { error: 'Energy calculations not complete. Please run energy calculations first.' },
        { status: 400 }
      );
    }
    
    // Check if financial calculations exist, if not calculate them
    const hasFinancialData = calculation.simplePaybackPeriod !== null;
    
    let financialResults;
    if (!hasFinancialData) {
      console.log('Financial calculations not found, calculating now...');
      
      // Prepare input for financial calculations
      const financialInput = {
        totalRetrofitCost: calculation.totalRetrofitCost || 0,
        annualEnergySavings: calculation.annualEnergySavings || 0,
        
        // LL97 fee data (current fees without upgrade)
        annualFeeExceedingBudget2024to2029: calculation.annualFeeExceedingBudget2024to2029 || 0,
        annualFeeExceedingBudget2030to2034: calculation.annualFeeExceedingBudget2030to2034 || 0,
        annualFeeExceedingBudget2035to2039: calculation.annualFeeExceedingBudget2035to2039 || 0,
        annualFeeExceedingBudget2040to2049: calculation.annualFeeExceedingBudget2040to2049 || 0,
        
        // LL97 fees with upgrade
        adjustedAnnualFeeBefore2027: calculation.adjustedAnnualFeeBefore2027 || 0,
        adjustedAnnualFee2027to2029: calculation.adjustedAnnualFee2027to2029 || 0,
        adjustedAnnualFee2030to2034: calculation.adjustedAnnualFee2030to2034 || 0,
        adjustedAnnualFee2035to2039: calculation.adjustedAnnualFee2035to2039 || 0,
        adjustedAnnualFee2040to2049: calculation.adjustedAnnualFee2040to2049 || 0,
        
        // Configuration
        config: {
          loanTermYears,
          annualInterestRate: interestRate
        }
      };
      
      financialResults = financialCalculationService.calculateFinancialAnalysis(financialInput);
      
      // TODO: Persist financial results to database
      
    } else {
      // Extract existing financial data
      financialResults = {
        annualLL97FeeAvoidance2024to2027: calculation.annualLL97FeeAvoidance2024to2027,
        annualLL97FeeAvoidance2027to2029: calculation.annualLL97FeeAvoidance2027to2029,
        annualLL97FeeAvoidance2030to2034: calculation.annualLL97FeeAvoidance2030to2034,
        annualLL97FeeAvoidance2035to2039: calculation.annualLL97FeeAvoidance2035to2039,
        annualLL97FeeAvoidance2040to2049: calculation.annualLL97FeeAvoidance2040to2049,
        simplePaybackPeriod: calculation.simplePaybackPeriod,
        cumulativeSavingsByYear: calculation.cumulativeSavingsByYear as number[] || [],
        // Loan data would be calculated dynamically based on query params
        loanBalanceByYear: [],
        monthlyPayment: 0,
        totalInterestPaid: 0,
        analysisConfig: {
          loanTermYears,
          annualInterestRate: interestRate,
          capRate: 0.04,
          analysisStartYear: 2024,
          analysisEndYear: 2050
        }
      };
    }
    
    // Generate visualization data
    const visualizationData = financialCalculationService.generateVisualizationData(financialResults);
    
    // Calculate financial summary
    const financialSummary = financialCalculationService.calculateFinancialSummary(financialResults);
    
    const response = {
      calculationId: calculation.id,
      ...financialResults,
      
      // Enhanced analysis
      visualization: visualizationData,
      summary: financialSummary,
      
      // Key insights
      insights: {
        paybackAchieved: financialResults.simplePaybackPeriod > 0,
        paybackYear: financialResults.simplePaybackPeriod,
        totalSavings20Years: financialResults.cumulativeSavingsByYear[19] || 0, // 20th year
        averageAnnualSavings: financialSummary.averageAnnualSavings,
        investmentMultiplier: Math.round((financialSummary.totalSavingsOverAnalysisPeriod / (calculation.totalRetrofitCost || 1)) * 100) / 100
      },
      
      // Metadata
      lastCalculated: calculation.updatedAt,
      buildingInfo: {
        address: calculation.address,
        totalRetrofitCost: calculation.totalRetrofitCost,
        annualEnergySavings: calculation.annualEnergySavings
      }
    };
    
    console.log(`Successfully retrieved financial analysis for ${params.id}`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error(`Error getting financial analysis: ${(error as Error).message}`, error);
    return NextResponse.json(
      { error: 'Failed to get financial analysis' },
      { status: 500 }
    );
  }
}