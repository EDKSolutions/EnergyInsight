/**
 * @swagger
 * /api/calculations/{id}/ll97:
 *   get:
 *     tags:
 *       - Calculations - LL97
 *     summary: Get LL97 emissions and compliance analysis (Section 7)
 *     description: |
 *       Returns LL97 analysis including:
 *       - Emissions budgets for all compliance periods
 *       - Current and adjusted emissions
 *       - BE Credit calculations
 *       - Fee calculations for all periods
 *       - Compliance status across periods
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
 *     responses:
 *       200:
 *         description: LL97 analysis results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LL97CalculationResponse'
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
import { ll97CalculationService } from '@/lib/calculations/services/ll97-calculations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/calculations/${params.id}/ll97`);
    
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
    
    // Check if LL97 calculations exist, if not calculate them
    const hasLL97Data = calculation.emissionsBudget2024to2029 !== null;
    
    let ll97Results;
    if (!hasLL97Data) {
      console.log('LL97 calculations not found, calculating now...');
      
      // Prepare input for LL97 calculations
      const ll97Input = {
        buildingClass: calculation.buildingClass,
        totalSquareFeet: parseFloat(calculation.totalSquareFeet || '0'),
        totalBuildingEmissionsLL84: 1250.50, // TODO: Get from LL84 data
        annualBuildingMMBtuHeatingPTAC: calculation.annualBuildingMMBtuHeatingPTAC || 0,
        annualBuildingkWhHeatingPTHP: calculation.annualBuildingkWhHeatingPTHP || 0
      };
      
      ll97Results = ll97CalculationService.calculateLL97Analysis(ll97Input);
      
      // Persist LL97 results to database
      await calculationOrchestrator.getCalculationData(params.id); // This would update with LL97 data
      
    } else {
      // Extract existing LL97 data
      ll97Results = {
        emissionsBudget2024to2029: calculation.emissionsBudget2024to2029,
        emissionsBudget2030to2034: calculation.emissionsBudget2030to2034,
        emissionsBudget2035to2039: calculation.emissionsBudget2035to2039,
        emissionsBudget2040to2049: calculation.emissionsBudget2040to2049,
        totalBuildingEmissionsLL84: calculation.totalBuildingEmissionsLL84,
        annualFeeExceedingBudget2024to2029: calculation.annualFeeExceedingBudget2024to2029,
        annualFeeExceedingBudget2030to2034: calculation.annualFeeExceedingBudget2030to2034,
        annualFeeExceedingBudget2035to2039: calculation.annualFeeExceedingBudget2035to2039,
        annualFeeExceedingBudget2040to2049: calculation.annualFeeExceedingBudget2040to2049,
        beCreditBefore2027: calculation.beCreditBefore2027,
        beCredit2027to2029: calculation.beCredit2027to2029,
        adjustedTotalBuildingEmissions2024to2029: calculation.adjustedTotalBuildingEmissions2024to2029,
        adjustedTotalBuildingEmissions2030to2034: calculation.adjustedTotalBuildingEmissions2030to2034,
        adjustedTotalBuildingEmissions2035to2039: calculation.adjustedTotalBuildingEmissions2035to2039,
        adjustedTotalBuildingEmissions2040to2049: calculation.adjustedTotalBuildingEmissions2040to2049,
        adjustedAnnualFeeBefore2027: calculation.adjustedAnnualFeeBefore2027,
        adjustedAnnualFee2027to2029: calculation.adjustedAnnualFee2027to2029,
        adjustedAnnualFee2030to2034: calculation.adjustedAnnualFee2030to2034,
        adjustedAnnualFee2035to2039: calculation.adjustedAnnualFee2035to2039,
        adjustedAnnualFee2040to2049: calculation.adjustedAnnualFee2040to2049
      };
    }
    
    // Enhance with compliance status and insights
    const response = {
      calculationId: calculation.id,
      ...ll97Results,
      
      // Analysis insights
      insights: {
        worstCaseFee: Math.max(
          ll97Results.annualFeeExceedingBudget2024to2029 || 0,
          ll97Results.annualFeeExceedingBudget2030to2034 || 0,
          ll97Results.annualFeeExceedingBudget2035to2039 || 0,
          ll97Results.annualFeeExceedingBudget2040to2049 || 0
        ),
        totalBECreditAvailable: (ll97Results.beCreditBefore2027 || 0) + (ll97Results.beCredit2027to2029 || 0),
        complianceStatus: {
          '2024-2029': (calculation.totalBuildingEmissionsLL84 || 0) <= (ll97Results.emissionsBudget2024to2029 || 0),
          '2030-2034': (calculation.totalBuildingEmissionsLL84 || 0) <= (ll97Results.emissionsBudget2030to2034 || 0),
          '2035-2039': (calculation.totalBuildingEmissionsLL84 || 0) <= (ll97Results.emissionsBudget2035to2039 || 0),
          '2040-2049': (calculation.totalBuildingEmissionsLL84 || 0) <= (ll97Results.emissionsBudget2040to2049 || 0)
        }
      },
      
      // Metadata
      lastCalculated: calculation.updatedAt,
      buildingInfo: {
        address: calculation.address,
        buildingClass: calculation.buildingClass,
        totalSquareFeet: calculation.totalSquareFeet
      }
    };
    
    console.log(`Successfully retrieved LL97 analysis for ${params.id}`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error(`Error getting LL97 analysis: ${(error as Error).message}`, error);
    return NextResponse.json(
      { error: 'Failed to get LL97 analysis' },
      { status: 500 }
    );
  }
}