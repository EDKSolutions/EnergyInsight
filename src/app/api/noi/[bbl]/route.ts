import { NextRequest, NextResponse } from 'next/server';
import { getNoiByBbl } from '@/lib/services/noi';
import { getUserFromRequest } from '../../auth/middleware';

/**
 * @swagger
 * /api/noi/{bbl}:
 *   get:
 *     tags:
 *       - NOI
 *     summary: Get Net Operating Income (NOI) for a building by BBL
 *     description: |
 *       Calculates Net Operating Income for NYC buildings using different methodologies based on building type:
 *       - **Cooperatives**: Direct API lookup from NYC Open Data Cooperative Comparable Rental Income dataset
 *       - **Condominiums**: Direct API lookup from NYC Open Data Condominium Comparable Rental Income dataset  
 *       - **Rental Buildings**: Calculated using static rates from NYC Rent Guidelines Board 2024 Income & Expense Study
 *       
 *       **Building Classification**: Uses NYC Department of Finance building class codes to determine building type.
 *       
 *       **Rental Calculation Formula**:
 *       - Gross Income = Units × Borough Rate × Age Multiplier × 12 months × 1.108 (supplemental income)
 *       - NOI = Gross Income × 0.45 (45% margin after operating expenses and taxes)
 *       
 *       **Data Sources**:
 *       - Cooperative/Condominium: NYC Open Data APIs with `net_operating_income` field
 *       - Rental: NYC Rent Guidelines Board 2024 study with borough-specific rates and building age adjustments
 *       
 *       **Error Handling**: Fails loudly with detailed error messages for missing data or invalid calculations.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bbl
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9]{10}$"
 *         description: | 
 *           NYC Building Block and Lot number (10 digits)
 *           
 *           **Test BBLs for copy/paste:**
 *           - `1015447501` - Condominium (350 E 82nd St) - Has NYC Open Data
 *           - `1007147501` - Condominium (450 W 17th St) - Has NYC Open Data  
 *           - `1007010062` - Rental (316 11th Ave) - Requires unit breakdown
 *         example: "1015447501"
 *       - in: query
 *         name: studioUnits
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of studio units (required for rental buildings or when API data unavailable)
 *         example: 10
 *       - in: query
 *         name: oneBedUnits
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of one-bedroom units (required for rental buildings or when API data unavailable)
 *         example: 15
 *       - in: query
 *         name: twoBedUnits
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of two-bedroom units (required for rental buildings or when API data unavailable)
 *         example: 20
 *       - in: query
 *         name: threePlusUnits
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of three-plus bedroom units (required for rental buildings or when API data unavailable)
 *         example: 5
 *     responses:
 *       200:
 *         description: NOI calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bbl:
 *                   type: string
 *                   description: NYC Building Block and Lot number
 *                   example: "1015447501"
 *                 buildingType:
 *                   type: string
 *                   enum: [COOPERATIVE, CONDOMINIUM, RENTAL]
 *                   description: Building ownership/management type
 *                   example: "RENTAL"
 *                 noiValue:
 *                   type: number
 *                   format: float
 *                   description: Net Operating Income in USD
 *                   example: 1250000.50
 *                 dataSource:
 *                   type: string
 *                   description: Source of the NOI data
 *                   example: "NYC Rent Guidelines Board 2024 Income & Expense Study"
 *                 calculationMethod:
 *                   type: string
 *                   description: How the NOI was determined
 *                   example: "Calculated from unit count, borough rates, and building age"
 *                 reportYear:
 *                   type: string
 *                   description: Year of the data (for API-sourced data)
 *                   example: "2024"
 *                 rawData:
 *                   type: object
 *                   description: Detailed calculation data or raw API response
 *               required: [bbl, buildingType, noiValue, dataSource, calculationMethod]
 *             examples:
 *               cooperative_response:
 *                 summary: Cooperative building NOI from NYC Open Data
 *                 value:
 *                   bbl: "1012340456"
 *                   buildingType: "COOPERATIVE"
 *                   noiValue: 850000.00
 *                   dataSource: "NYC Open Data - Cooperative Comparable Rental Income"
 *                   calculationMethod: "Direct API value"
 *                   reportYear: "2023"
 *                   rawData:
 *                     bbl: "1012340456"
 *                     net_operating_income: "850000.00"
 *                     gross_income: "1200000.00"
 *                     report_year: "2023"
 *               condominium_response:
 *                 summary: Condominium building NOI from NYC Open Data (350 E 82nd St)
 *                 value:
 *                   bbl: "1015447501"
 *                   buildingType: "CONDOMINIUM"
 *                   noiValue: 6844140.00
 *                   dataSource: "NYC Open Data - Condominium Comparable Rental Income"
 *                   calculationMethod: "Direct API value"
 *                   reportYear: "2021"
 *                   rawData:
 *                     boro_block_lot: "1-01544-7501"
 *                     address: "350 EAST 82 STREET"
 *                     building_classification: "R4 -ELEVATOR"
 *                     total_units: "148"
 *                     year_built: "1998"
 *                     net_operating_income: "6844140"
 *                     estimated_gross_income: "10099235"
 *                     report_year: "2021"
 *               rental_response:
 *                 summary: Rental building NOI calculated from static rates (316 11th Ave)
 *                 value:
 *                   bbl: "1007010062"
 *                   buildingType: "RENTAL"
 *                   noiValue: 3250000.00
 *                   dataSource: "NYC Rent Guidelines Board 2024 Income & Expense Study"
 *                   calculationMethod: "Calculated from unit count, borough rates, and building age"
 *                   rawData:
 *                     buildingSquareFeet: 387468
 *                     borough: "MN"
 *                     yearBuilt: 2008
 *                     unitBreakdown:
 *                       studio: 50
 *                       oneBed: 150
 *                       tweBed: 120
 *                       threePlus: 50
 *                     ratePerUnitPerMonth: 3595.68
 *                     ageMultiplier: 1.442
 *                     supplementalIncomeMultiplier: 1.108
 *                     noiMargin: 0.45
 *                     grossIncome: 7222222.00
 *                     calculatedNoi: 3250000.00
 *               fallback_response:
 *                 summary: Condominium building using fallback calculation (API data unavailable)
 *                 value:
 *                   bbl: "1007010062"
 *                   buildingType: "CONDOMINIUM"
 *                   noiValue: 3250000.00
 *                   dataSource: "NYC Rent Guidelines Board 2024 Income & Expense Study (NYC Open Data unavailable)"
 *                   calculationMethod: "Calculated using rental method (API data unavailable)"
 *                   rawData:
 *                     buildingSquareFeet: 387468
 *                     borough: "MN"
 *                     yearBuilt: 2008
 *                     unitBreakdown:
 *                       studio: 50
 *                       oneBed: 150
 *                       twoBed: 120
 *                       threePlus: 50
 *                     ratePerUnitPerMonth: 3595.68
 *                     ageMultiplier: 1.442
 *                     supplementalIncomeMultiplier: 1.108
 *                     noiMargin: 0.45
 *                     grossIncome: 7222222.00
 *                     calculatedNoi: 3250000.00
 *       400:
 *         description: Invalid BBL format or missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_bbl:
 *                 summary: Invalid BBL format
 *                 value:
 *                   error: "BBL must be exactly 10 digits"
 *               missing_units_rental:
 *                 summary: Missing unit breakdown for rental building
 *                 value:
 *                   error: "Unit breakdown data required for rental building NOI calculation for BBL: 1007010062"
 *               missing_units_fallback:
 *                 summary: Missing unit breakdown when API data unavailable
 *                 value:
 *                   error: "Cooperative NOI data not available for BBL: 1012340456 and unit breakdown not provided. Either provide unit breakdown parameters or use a building with available NYC Open Data."
 *               invalid_unit_counts:
 *                 summary: Invalid unit count values
 *                 value:
 *                   error: "Unit counts must be non-negative integers"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Building data not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               no_pluto_data:
 *                 summary: PLUTO data not found
 *                 value:
 *                   error: "PLUTO data not found for BBL: 9999999999"
 *               no_api_data:
 *                 summary: Cooperative/Condominium data not available (requires unit breakdown for fallback)
 *                 value:
 *                   error: "Cooperative NOI data not available for BBL: 1012340456 and unit breakdown not provided. Either provide unit breakdown parameters or use a building with available NYC Open Data."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               calculation_error:
 *                 summary: Calculation error
 *                 value:
 *                   error: "Building square footage is missing or zero for BBL 1007010062"
 *               api_error:
 *                 summary: External API error
 *                 value:
 *                   error: "Error fetching PLUTO data: HTTP error! status: 500"
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bbl: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bbl } = await params;
    
    // Validate BBL format
    if (!bbl || !/^[0-9]{10}$/.test(bbl)) {
      return NextResponse.json(
        { error: 'BBL must be exactly 10 digits' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse unit breakdown parameters (only needed for rental buildings)
    const studioUnits = searchParams.get('studioUnits');
    const oneBedUnits = searchParams.get('oneBedUnits');
    const twoBedUnits = searchParams.get('twoBedUnits');
    const threePlusUnits = searchParams.get('threePlusUnits');
    
    let unitBreakdown;
    if (studioUnits || oneBedUnits || twoBedUnits || threePlusUnits) {
      unitBreakdown = {
        studio: parseInt(studioUnits || '0'),
        oneBed: parseInt(oneBedUnits || '0'),
        twoBed: parseInt(twoBedUnits || '0'),
        threePlus: parseInt(threePlusUnits || '0')
      };
      
      // Validate unit counts
      if (Object.values(unitBreakdown).some(count => isNaN(count) || count < 0)) {
        return NextResponse.json(
          { error: 'Unit counts must be non-negative integers' },
          { status: 400 }
        );
      }
    }

    const noiResult = await getNoiByBbl(bbl, unitBreakdown);

    return NextResponse.json(noiResult);
  } catch (error) {
    console.error('Error in NOI API:', error);
    
    const errorMessage = (error as Error).message;
    
    // Determine appropriate HTTP status code based on error type
    let statusCode = 500; // Default to internal server error
    
    if (errorMessage.includes('not found') || errorMessage.includes('not available')) {
      statusCode = 404;
    } else if (errorMessage.includes('required') || errorMessage.includes('missing') || 
               errorMessage.includes('Invalid') || errorMessage.includes('Unknown')) {
      statusCode = 400;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}