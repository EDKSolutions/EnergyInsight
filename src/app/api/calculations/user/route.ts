import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../auth/middleware';
import { getUserCalculations } from '@/lib/services/calculations';

/**
 * @swagger
 * /api/calculations/user:
 *   get:
 *     tags:
 *       - Calculations
 *     summary: Get all calculations for the authenticated user
 *     description: |
 *       Retrieves all energy calculations created by the authenticated user.
 *       Returns a list of calculations with complete energy analysis data.
 *       Results are ordered by creation date (most recent first).
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User calculations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Calculation'
 *             examples:
 *               user_calculations:
 *                 summary: List of user calculations
 *                 value:
 *                   - id: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *                     bbl: "1012340456"
 *                     buildingName: "123 Main Street"
 *                     address: "123 MAIN STREET"
 *                     yearBuilt: "1925"
 *                     stories: "6"
 *                     buildingClass: "R6"
 *                     taxClass: "2"
 *                     zoning: "R6B"
 *                     boro: "MANHATTAN"
 *                     totalSquareFeet: "12500"
 *                     totalResidentialUnits: "24"
 *                     ptacUnits: "20"
 *                     capRate: "4.5"
 *                     buildingValue: "2500000"
 *                     unitMixBreakDown: '{"studio": 6, "one_bed": 10, "two_bed": 6, "three_plus": 2}'
 *                     energyProfile: '{"electric": "65%", "gas": "35%"}'
 *                     annualBuildingMMBtuCoolingPTAC: 2469.12
 *                     annualBuildingMMBtuHeatingPTAC: 5100.00
 *                     annualBuildingMMBtuTotalPTAC: 7569.12
 *                     annualBuildingMMBtuHeatingPTHP: 2401.00
 *                     annualBuildingMMBtuCoolingPTHP: 2469.12
 *                     annualBuildingMMBtuTotalPTHP: 4870.12
 *                     energyReductionPercentage: 35.67
 *                     totalRetrofitCost: 136400.00
 *                     annualBuildingThermsHeatingPTAC: 51000.00
 *                     annualBuildingKwhCoolingPTAC: 320000.00
 *                     annualBuildingKwhHeatingPTHP: 42857.14
 *                     annualBuildingKwhCoolingPTHP: 320000.00
 *                     annualBuildingCostPTAC: 154000.00
 *                     annualBuildingCostPTHP: 90714.28
 *                     annualEnergySavings: 63285.72
 *                     siteEUI: "78.5"
 *                     occupancyRate: "92"
 *                     maintenanceCost: "125000"
 *                     rawPlutoData: { "building_class": "R6", "year_built": 1925 }
 *                     rawLL84Data: { "site_eui": 78.5, "weather_norm_site_eui": 82.1 }
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *                   - id: "b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7"
 *                     bbl: "3098760123"
 *                     buildingName: "456 Oak Avenue"
 *                     address: "456 OAK AVENUE"
 *                     yearBuilt: "1960"
 *                     stories: "4"
 *                     buildingClass: "R4"
 *                     taxClass: "2"
 *                     zoning: "R5"
 *                     boro: "BROOKLYN"
 *                     totalSquareFeet: "8000"
 *                     totalResidentialUnits: "12"
 *                     ptacUnits: "10"
 *                     capRate: "5.5"
 *                     buildingValue: "1500000"
 *                     unitMixBreakDown: '{"studio": 3, "one_bed": 6, "two_bed": 3}'
 *                     energyProfile: '{"electric": "70%", "gas": "30%"}'
 *                     annualBuildingMMBtuCoolingPTAC: 1234.56
 *                     annualBuildingMMBtuHeatingPTAC: 2550.00
 *                     annualBuildingMMBtuTotalPTAC: 3784.56
 *                     annualBuildingMMBtuHeatingPTHP: 1200.50
 *                     annualBuildingMMBtuCoolingPTHP: 1234.56
 *                     annualBuildingMMBtuTotalPTHP: 2435.06
 *                     energyReductionPercentage: 35.67
 *                     totalRetrofitCost: 68200.00
 *                     annualBuildingThermsHeatingPTAC: 25500.00
 *                     annualBuildingKwhCoolingPTAC: 160000.00
 *                     annualBuildingKwhHeatingPTHP: 21428.57
 *                     annualBuildingKwhCoolingPTHP: 160000.00
 *                     annualBuildingCostPTAC: 77000.00
 *                     annualBuildingCostPTHP: 45357.14
 *                     annualEnergySavings: 31642.86
 *                     siteEUI: "65.5"
 *                     occupancyRate: "95"
 *                     maintenanceCost: "75000"
 *                     rawPlutoData: { "building_class": "R4", "year_built": 1960 }
 *                     rawLL84Data: { "site_eui": 65.5, "weather_norm_site_eui": 68.2 }
 *                     createdAt: "2024-01-12T08:15:00.000Z"
 *                     updatedAt: "2024-01-12T08:15:00.000Z"
 *               empty_calculations:
 *                 summary: Empty calculations list
 *                 value: []
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 */

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const calculations = await getUserCalculations(user.userId);
    return NextResponse.json(calculations);
  } catch (error) {
    console.error('Error fetching user calculations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}