import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../auth/middleware';
import { createCalculation } from '@/lib/services/calculations';

/**
 * @swagger
 * /api/calculations:
 *   post:
 *     tags:
 *       - Calculations
 *     summary: Create a new energy calculation
 *     description: |
 *       Creates a new building energy calculation by analyzing PTAC to PTHP conversion potential.
 *       The system automatically fetches building data from NYC APIs (GeoClient, PLUTO, LL84)
 *       and performs comprehensive energy analysis including:
 *       - Building characteristics analysis
 *       - Energy consumption calculations (MMBtu, kWh, therms)
 *       - Cost analysis and savings projections
 *       - Retrofit cost estimation
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CalculationInput'
 *           examples:
 *             manhattan_example:
 *               summary: Manhattan residential building
 *               value:
 *                 houseNumber: "123"
 *                 street: "Main Street"
 *                 borough: "Manhattan"
 *                 address: "123 Main Street, Manhattan, NY 10001"
 *             brooklyn_example:
 *               summary: Brooklyn apartment building
 *               value:
 *                 houseNumber: "456"
 *                 street: "Oak Avenue"
 *                 borough: "Brooklyn"
 *                 address: "456 Oak Avenue, Brooklyn, NY 11201"
 *             queens_example:
 *               summary: Queens multi-family building
 *               value:
 *                 houseNumber: "789"
 *                 street: "Elm Street"
 *                 borough: "Queens"
 *                 address: "789 Elm Street, Queens, NY 11101"
 *     responses:
 *       200:
 *         description: Calculation created successfully with full energy analysis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Calculation'
 *             examples:
 *               complete_calculation:
 *                 summary: Complete energy calculation result
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
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Missing required parameters: houseNumber, street, borough, address"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       422:
 *         description: Unprocessable Entity - Data not found or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               bbl_not_found:
 *                 summary: BBL could not be resolved
 *                 value:
 *                   error: "cannot find BBL"
 *               pluto_data_not_found:
 *                 summary: No PLUTO data available
 *                 value:
 *                   error: "No PLUTO data found for BBL"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 */

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { houseNumber, street, borough, address } = body;

    if (!houseNumber || !street || !borough || !address) {
      return NextResponse.json(
        { error: 'Missing required parameters: houseNumber, street, borough, address' },
        { status: 400 }
      );
    }

    const calculation = await createCalculation(user.userId, {
      houseNumber,
      street,
      borough,
      address,
    });

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Error creating calculation:', error);
    
    if ((error as Error).message === 'cannot find BBL') {
      return NextResponse.json({ error: 'cannot find BBL' }, { status: 422 });
    }
    
    if ((error as Error).message === 'No PLUTO data found for BBL') {
      return NextResponse.json({ error: 'No PLUTO data found for BBL' }, { status: 422 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
