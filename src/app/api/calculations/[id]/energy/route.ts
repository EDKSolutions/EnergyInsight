/**
 * @swagger
 * /api/calculations/{id}/energy:
 *   get:
 *     tags:
 *       - Calculations - Energy
 *     summary: Get energy calculations only (Sections 2-6)
 *     description: |
 *       Returns energy calculation results for a specific calculation including:
 *       - PTAC system calculations (Section 2)
 *       - PTHP system calculations (Section 3) 
 *       - Energy reduction analysis (Section 4)
 *       - Retrofit cost calculation (Section 5)
 *       - Energy cost savings (Section 6)
 *       - EFLH-adjusted heating calculations
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
 *         description: Energy calculation results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnergyCalculationResponse'
 *       404:
 *         description: Calculation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../auth/middleware';
import { calculationOrchestrator } from '@/lib/calculations/orchestrators/calculation-orchestrator';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/calculations/${params.id}/energy`);
    
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
    
    // Verify user has access to this calculation
    // This would typically check user permissions or ownership
    
    // Extract energy-related fields
    const energyResults = {
      calculationId: calculation.id,
      ptacUnits: parseInt(calculation.ptacUnits),
      
      // EFLH calculations
      eflhHours: calculation.eflhHours,
      annualBuildingkWhHeatingPTHP: calculation.annualBuildingkWhHeatingPTHP,
      
      // Section 2 - PTAC Building Calculations
      annualBuildingMMBtuCoolingPTAC: calculation.annualBuildingMMBtuCoolingPTAC,
      annualBuildingMMBtuHeatingPTAC: calculation.annualBuildingMMBtuHeatingPTAC,
      annualBuildingMMBtuTotalPTAC: calculation.annualBuildingMMBtuTotalPTAC,
      
      // Section 3 - PTHP Building Calculations  
      annualBuildingMMBtuHeatingPTHP: calculation.annualBuildingMMBtuHeatingPTHP,
      annualBuildingMMBtuCoolingPTHP: calculation.annualBuildingMMBtuCoolingPTHP,
      annualBuildingMMBtuTotalPTHP: calculation.annualBuildingMMBtuTotalPTHP,
      
      // Section 4 - Energy Reduction Analysis
      energyReductionPercentage: calculation.energyReductionPercentage,
      
      // Section 5 - Retrofit Cost Calculation
      totalRetrofitCost: calculation.totalRetrofitCost,
      
      // Section 6 - Energy Cost Savings
      annualBuildingThermsHeatingPTAC: calculation.annualBuildingThermsHeatingPTAC,
      annualBuildingKwhCoolingPTAC: calculation.annualBuildingKwhCoolingPTAC,
      annualBuildingKwhHeatingPTHP: calculation.annualBuildingKwhHeatingPTHP,
      annualBuildingKwhCoolingPTHP: calculation.annualBuildingKwhCoolingPTHP,
      annualBuildingCostPTAC: calculation.annualBuildingCostPTAC,
      annualBuildingCostPTHP: calculation.annualBuildingCostPTHP,
      annualEnergySavings: calculation.annualEnergySavings,
      
      // Metadata
      lastCalculated: calculation.updatedAt,
      buildingInfo: {
        address: calculation.address,
        yearBuilt: calculation.yearBuilt,
        stories: calculation.stories,
        buildingClass: calculation.buildingClass,
        totalSquareFeet: calculation.totalSquareFeet,
        totalResidentialUnits: calculation.totalResidentialUnits
      }
    };
    
    console.log(`Successfully retrieved energy calculations for ${params.id}`);
    return NextResponse.json(energyResults);
    
  } catch (error) {
    console.error(`Error getting energy calculations: ${(error as Error).message}`, error);
    return NextResponse.json(
      { error: 'Failed to get energy calculations' },
      { status: 500 }
    );
  }
}