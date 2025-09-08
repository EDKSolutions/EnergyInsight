/**
 * @swagger
 * /api/calculations/{id}/property-value:
 *   get:
 *     tags:
 *       - Calculations - Property Value
 *     summary: Get property value analysis (Section 10)
 *     description: |
 *       Returns comprehensive property value analysis including:
 *       - Property values with and without upgrade
 *       - Net property value gain calculations
 *       - Cap rate sensitivity analysis
 *       - Value-to-investment ratio analysis
 *       - Visualization data for property value charts
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
 *       - name: capRate
 *         in: query
 *         required: false
 *         description: Cap rate for property valuation (default 4%)
 *         schema:
 *           type: number
 *           minimum: 0.01
 *           maximum: 0.20
 *     responses:
 *       200:
 *         description: Property value analysis results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertyValueResponse'
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
import { propertyValueCalculationService } from '@/lib/calculations/services/property-value-calculations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/calculations/${params.id}/property-value`);
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const capRate = parseFloat(searchParams.get('capRate') || '0.04');
    
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
    
    // Check if property value calculations exist, if not calculate them
    const hasPropertyValueData = calculation.propertyValueNoUpgrade !== null;
    
    let propertyValueResults;
    if (!hasPropertyValueData) {
      console.log('Property value calculations not found, calculating now...');
      
      // First we need NOI results
      const noiResults = {
        currentNOI: calculation.currentNOI || 1200000, // TODO: Get from NOI calculation
        noiNoUpgrade2024to2029: calculation.noiNoUpgrade2024to2029 || 1050000,
        noiNoUpgrade2030to2034: calculation.noiNoUpgrade2030to2034 || 900000,
        noiNoUpgrade2035to2039: calculation.noiNoUpgrade2035to2039 || 900000,
        noiNoUpgrade2040to2049: calculation.noiNoUpgrade2040to2049 || 900000,
        noiWithUpgrade2024to2027: calculation.noiWithUpgrade2024to2027 || 1224000,
        noiWithUpgrade2027to2029: calculation.noiWithUpgrade2027to2029 || 1224000,
        noiWithUpgrade2030to2034: calculation.noiWithUpgrade2030to2034 || 1206000,
        noiWithUpgrade2035to2039: calculation.noiWithUpgrade2035to2039 || 1206000,
        noiWithUpgrade2040to2049: calculation.noiWithUpgrade2040to2049 || 1206000
      };
      
      const propertyValueInput = {
        noiResults,
        capRate
      };
      
      propertyValueResults = propertyValueCalculationService.calculatePropertyValueAnalysis(propertyValueInput);
      
      // TODO: Persist property value results to database
      
    } else {
      // Extract existing property value data  
      propertyValueResults = {
        propertyValueNoUpgrade: calculation.propertyValueNoUpgrade,
        propertyValueWithUpgrade2024to2027: calculation.propertyValueWithUpgrade || 0,
        propertyValueWithUpgrade2027to2029: calculation.propertyValueWithUpgrade || 0,
        propertyValueWithUpgrade2030to2034: calculation.propertyValueWithUpgrade || 0,
        propertyValueWithUpgrade2035to2039: calculation.propertyValueWithUpgrade || 0,
        propertyValueWithUpgrade2040to2049: calculation.propertyValueWithUpgrade || 0,
        netPropertyValueGain: calculation.netPropertyValueGain,
        capRateUsed: calculation.capRateUsed || capRate
      };
    }
    
    // Calculate cap rate sensitivity analysis
    const noiResults = {
      currentNOI: calculation.currentNOI || 1200000,
      noiNoUpgrade2024to2029: calculation.noiNoUpgrade2024to2029 || 1050000,
      noiNoUpgrade2030to2034: calculation.noiNoUpgrade2030to2034 || 900000,
      noiNoUpgrade2035to2039: calculation.noiNoUpgrade2035to2039 || 900000,
      noiNoUpgrade2040to2049: calculation.noiNoUpgrade2040to2049 || 900000,
      noiWithUpgrade2024to2027: calculation.noiWithUpgrade2024to2027 || 1224000,
      noiWithUpgrade2027to2029: calculation.noiWithUpgrade2027to2029 || 1224000,
      noiWithUpgrade2030to2034: calculation.noiWithUpgrade2030to2034 || 1206000,
      noiWithUpgrade2035to2039: calculation.noiWithUpgrade2035to2039 || 1206000,
      noiWithUpgrade2040to2049: calculation.noiWithUpgrade2040to2049 || 1206000
    };
    
    const sensitivityAnalysis = propertyValueCalculationService.calculateCapRateSensitivityAnalysis(noiResults);
    
    // Generate visualization data
    const visualizationData = propertyValueCalculationService.generatePropertyValueVisualizationData(
      propertyValueResults,
      noiResults
    );
    
    // Calculate impact summary
    const impactSummary = propertyValueCalculationService.calculatePropertyValueImpactSummary(
      propertyValueResults,
      calculation.totalRetrofitCost || 0
    );
    
    const response = {
      calculationId: calculation.id,
      ...propertyValueResults,
      
      // Enhanced analysis
      sensitivityAnalysis,
      visualization: visualizationData,
      impactSummary,
      
      // Key insights
      insights: {
        // Investment returns
        valueToInvestmentRatio: impactSummary.valueToInvestmentRatio,
        returnOnInvestment: impactSummary.returnOnInvestment,
        
        // Value protection
        valueProtection: propertyValueResults.netPropertyValueGain,
        valueAtRisk: propertyValueResults.propertyValueWithUpgrade2040to2049 - propertyValueResults.propertyValueNoUpgrade,
        
        // Market position
        compellingInvestment: impactSummary.valueToInvestmentRatio > 3, // 3:1 or better value creation
        paybackViaValueGain: (calculation.totalRetrofitCost || 0) < propertyValueResults.netPropertyValueGain,
        
        // Long-term benefits
        sustainedValueAdvantage: propertyValueResults.propertyValueWithUpgrade2040to2049 - propertyValueResults.propertyValueNoUpgrade,
        percentageGain: ((propertyValueResults.netPropertyValueGain / (propertyValueResults.propertyValueNoUpgrade || 1)) * 100),
        
        // Risk mitigation
        penaltyRisk: 'High without upgrade - property values decline significantly post-2030',
        upgradeWindow: 'Optimal window 2024-2027 for maximum BE credit benefits'
      },
      
      // Metadata
      lastCalculated: calculation.updatedAt,
      buildingInfo: {
        address: calculation.address,
        totalSquareFeet: calculation.totalSquareFeet,
        totalRetrofitCost: calculation.totalRetrofitCost,
        currentValue: propertyValueCalculationService.calculatePropertyValueByScenario(noiResults.currentNOI, capRate)
      }
    };
    
    console.log(`Successfully retrieved property value analysis for ${params.id}`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error(`Error getting property value analysis: ${(error as Error).message}`, error);
    return NextResponse.json(
      { error: 'Failed to get property value analysis' },
      { status: 500 }
    );
  }
}