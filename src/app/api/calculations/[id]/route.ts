import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../auth/middleware';
import { getCalculationById, modifyCalculation } from '@/lib/services/calculations';

/**
 * @swagger
 * /api/calculations/{id}:
 *   get:
 *     tags:
 *       - Calculations
 *     summary: Get a specific calculation by ID
 *     description: |
 *       Retrieves a complete energy calculation by its unique identifier.
 *       Only the calculation owner can access their calculations.
 *       Returns all calculated values including energy consumption, costs, and savings projections.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique calculation identifier
 *         example: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *     responses:
 *       200:
 *         description: Calculation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Calculation'
 *             examples:
 *               manhattan_calculation:
 *                 summary: Manhattan building calculation
 *                 value:
 *                   id: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *                   bbl: "1012340456"
 *                   buildingName: "123 Main Street"
 *                   address: "123 MAIN STREET"
 *                   yearBuilt: "1925"
 *                   stories: "6"
 *                   buildingClass: "R6"
 *                   taxClass: "2"
 *                   zoning: "R6B"
 *                   boro: "MANHATTAN"
 *                   totalSquareFeet: "12500"
 *                   totalResidentialUnits: "24"
 *                   ptacUnits: "20"
 *                   capRate: "4.5"
 *                   buildingValue: "2500000"
 *                   unitMixBreakDown: '{"studio": 6, "one_bed": 10, "two_bed": 6, "three_plus": 2}'
 *                   energyProfile: '{"electric": "65%", "gas": "35%"}'
 *                   annualBuildingMMBtuCoolingPTAC: 2469.12
 *                   annualBuildingMMBtuHeatingPTAC: 5100.00
 *                   annualBuildingMMBtuTotalPTAC: 7569.12
 *                   annualBuildingMMBtuHeatingPTHP: 2401.00
 *                   annualBuildingMMBtuCoolingPTHP: 2469.12
 *                   annualBuildingMMBtuTotalPTHP: 4870.12
 *                   energyReductionPercentage: 35.67
 *                   totalRetrofitCost: 136400.00
 *                   annualBuildingThermsHeatingPTAC: 51000.00
 *                   annualBuildingKwhCoolingPTAC: 320000.00
 *                   annualBuildingKwhHeatingPTHP: 42857.14
 *                   annualBuildingKwhCoolingPTHP: 320000.00
 *                   annualBuildingCostPTAC: 154000.00
 *                   annualBuildingCostPTHP: 90714.28
 *                   annualEnergySavings: 63285.72
 *                   siteEUI: "78.5"
 *                   occupancyRate: "92"
 *                   maintenanceCost: "125000"
 *                   rawPlutoData: { "building_class": "R6", "year_built": 1925 }
 *                   rawLL84Data: { "site_eui": 78.5, "weather_norm_site_eui": 82.1 }
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                   updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Calculation not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Calculation not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 *   put:
 *     tags:
 *       - Calculations
 *     summary: Update a calculation
 *     description: |
 *       Updates an existing energy calculation with new values.
 *       Only the calculation owner can modify their calculations.
 *       Allows updating input parameters and will recalculate derived values.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique calculation identifier
 *         example: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ptacUnits:
 *                 type: string
 *                 example: "18"
 *                 description: "Updated number of PTAC units"
 *               capRate:
 *                 type: string
 *                 example: "5.0"
 *                 description: "Updated capitalization rate"
 *               buildingValue:
 *                 type: string
 *                 example: "2750000"
 *                 description: "Updated building value"
 *               occupancyRate:
 *                 type: string
 *                 example: "95"
 *                 description: "Updated occupancy rate"
 *               maintenanceCost:
 *                 type: string
 *                 example: "130000"
 *                 description: "Updated annual maintenance cost"
 *           examples:
 *             basic_update:
 *               summary: Update key calculation parameters
 *               value:
 *                 ptacUnits: "18"
 *                 capRate: "5.0"
 *                 buildingValue: "2750000"
 *                 occupancyRate: "95"
 *                 maintenanceCost: "130000"
 *             unit_adjustment:
 *               summary: Adjust PTAC units only
 *               value:
 *                 ptacUnits: "22"
 *             financial_update:
 *               summary: Update financial parameters
 *               value:
 *                 capRate: "4.75"
 *                 buildingValue: "2600000"
 *                 maintenanceCost: "120000"
 *     responses:
 *       200:
 *         description: Calculation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Calculation'
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Calculation not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Calculation not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const calculation = await getCalculationById(resolvedParams.id, user.userId);
    
    if (!calculation) {
      return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });
    }

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Error fetching calculation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    
    // Verify user owns the calculation
    const existingCalculation = await getCalculationById(resolvedParams.id, user.userId);
    if (!existingCalculation) {
      return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });
    }

    const body = await request.json();
    const updatedCalculation = await modifyCalculation(resolvedParams.id, body);

    return NextResponse.json(updatedCalculation);
  } catch (error) {
    console.error('Error updating calculation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}