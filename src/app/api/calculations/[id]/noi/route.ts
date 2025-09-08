/**
 * @swagger
 * /api/calculations/{id}/noi:
 *   get:
 *     tags:
 *       - Calculations - NOI
 *     summary: Get NOI (Net Operating Income) analysis (Section 9)
 *     description: |
 *       Returns NOI analysis comparing upgrade vs no-upgrade scenarios including:
 *       - Current baseline NOI
 *       - NOI projections without upgrade (with LL97 penalties)
 *       - NOI projections with upgrade (with energy savings)
 *       - NOI gap analysis across compliance periods
 *       - Visualization data for NOI comparison charts
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
 *         description: NOI analysis results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NOICalculationResponse'
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
import { noiCalculationService } from '@/lib/calculations/services/noi-calculations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/calculations/${params.id}/noi`);
    
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
    
    // Check if NOI calculations exist, if not calculate them
    const hasNOIData = calculation.currentNOI !== null;
    
    let noiResults;
    if (!hasNOIData) {
      console.log('NOI calculations not found, calculating now...');
      
      // Prepare input for NOI calculations
      const noiInput = {
        bbl: calculation.bbl,
        unitBreakdown: JSON.parse(calculation.unitMixBreakDown || '{}'),
        annualEnergySavings: calculation.annualEnergySavings || 0,
        
        // LL97 fees without upgrade
        annualFeeExceedingBudget2024to2029: calculation.annualFeeExceedingBudget2024to2029 || 0,
        annualFeeExceedingBudget2030to2034: calculation.annualFeeExceedingBudget2030to2034 || 0,
        annualFeeExceedingBudget2035to2039: calculation.annualFeeExceedingBudget2035to2039 || 0,
        annualFeeExceedingBudget2040to2049: calculation.annualFeeExceedingBudget2040to2049 || 0,
        
        // LL97 fees with upgrade
        adjustedAnnualFeeBefore2027: calculation.adjustedAnnualFeeBefore2027 || 0,
        adjustedAnnualFee2027to2029: calculation.adjustedAnnualFee2027to2029 || 0,
        adjustedAnnualFee2030to2034: calculation.adjustedAnnualFee2030to2034 || 0,
        adjustedAnnualFee2035to2039: calculation.adjustedAnnualFee2035to2039 || 0,
        adjustedAnnualFee2040to2049: calculation.adjustedAnnualFee2040to2049 || 0
      };
      
      noiResults = await noiCalculationService.calculateNOIAnalysis(noiInput);
      
      // TODO: Persist NOI results to database
      
    } else {
      // Extract existing NOI data
      noiResults = {
        currentNOI: calculation.currentNOI,
        noiNoUpgrade2024to2029: calculation.noiNoUpgrade2024to2029,
        noiNoUpgrade2030to2034: calculation.noiNoUpgrade2030to2034,
        noiNoUpgrade2035to2039: calculation.noiNoUpgrade2035to2039,
        noiNoUpgrade2040to2049: calculation.noiNoUpgrade2040to2049,
        noiWithUpgrade2024to2027: calculation.noiWithUpgrade2024to2027,
        noiWithUpgrade2027to2029: calculation.noiWithUpgrade2027to2029,
        noiWithUpgrade2030to2034: calculation.noiWithUpgrade2030to2034,
        noiWithUpgrade2035to2039: calculation.noiWithUpgrade2035to2039,
        noiWithUpgrade2040to2049: calculation.noiWithUpgrade2040to2049
      };
    }
    
    // Calculate NOI gap analysis
    const gapAnalysis = noiCalculationService.calculateNOIGapAnalysis(noiResults);
    
    // Generate visualization data
    const visualizationData = noiCalculationService.generateNOIVisualizationData(noiResults);
    
    // Calculate impact summary
    const impactSummary = noiCalculationService.calculateNOIImpactSummary(noiResults);
    
    const response = {
      calculationId: calculation.id,
      ...noiResults,
      
      // Enhanced analysis
      gapAnalysis,
      visualization: visualizationData,
      impactSummary,
      
      // Key insights
      insights: {
        // Immediate benefits
        immediateNOIBoost: impactSummary.immediateNOIBoost,
        immediateBoostPercentage: impactSummary.immediateNOIBoostPercentage,
        
        // Long-term benefits
        sustainedAnnualBenefit: gapAnalysis.sustainedBenefit,
        riskMitigation: impactSummary.riskMitigation,
        
        // Critical periods
        worstCaseWithoutUpgrade: Math.min(
          noiResults.noiNoUpgrade2030to2034 || 0,
          noiResults.noiNoUpgrade2035to2039 || 0,
          noiResults.noiNoUpgrade2040to2049 || 0
        ),
        bestCaseWithUpgrade: Math.max(
          noiResults.noiWithUpgrade2024to2027 || 0,
          noiResults.noiWithUpgrade2027to2029 || 0,
          noiResults.noiWithUpgrade2030to2034 || 0
        ),
        
        // Timeline insights
        penaltyStartYear: 2026, // When LL97 penalties begin
        upgradeOptimalWindow: '2024-2027', // Best time for upgrade with BE credits
        sustainedBenefitPeriod: '2035+' // When benefits become permanent
      },
      
      // Metadata
      lastCalculated: calculation.updatedAt,
      buildingInfo: {
        address: calculation.address,
        bbl: calculation.bbl,
        totalResidentialUnits: calculation.totalResidentialUnits,
        currentNOI: noiResults.currentNOI
      }
    };
    
    console.log(`Successfully retrieved NOI analysis for ${params.id}`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error(`Error getting NOI analysis: ${(error as Error).message}`, error);
    return NextResponse.json(
      { error: 'Failed to get NOI analysis' },
      { status: 500 }
    );
  }
}