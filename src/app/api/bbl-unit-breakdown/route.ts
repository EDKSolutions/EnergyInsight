import { NextRequest, NextResponse } from 'next/server';
import { getPlutoDataByBbl, getLocalLaw84DataByBbl } from '@/lib/services/open-data-nyc';
import { UnitBreakdownService } from '@/lib/ai/services/unit-breakdown.service';
import { PlutoRecord } from '@/lib/ai/types';

const unitBreakdownService = new UnitBreakdownService();

/**
 * @swagger
 * /api/bbl-unit-breakdown:
 *   post:
 *     tags:
 *       - Analysis
 *     summary: Analyze building unit breakdown by BBL
 *     description: |
 *       Analyzes a building's unit distribution and energy characteristics using only the BBL (Borough-Block-Lot) number.
 *       This endpoint performs the same unit breakdown analysis as the main calculations endpoint but does NOT save
 *       results to the database. Perfect for testing, exploration, and Swagger documentation.
 *       
 *       The analysis includes:
 *       - AI-powered unit mix breakdown (studio, 1-bed, 2-bed, 3+ bed)
 *       - PTAC unit calculations and energy consumption analysis
 *       - PTHP conversion analysis and energy savings projections
 *       - Cost analysis and retrofit estimations
 *       - Building characteristics and values extraction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bbl
 *             properties:
 *               bbl:
 *                 type: string
 *                 description: 10-digit Borough-Block-Lot number (without dashes)
 *                 pattern: '^[0-9]{10}$'
 *                 example: "1012340456"
 *           examples:
 *             manhattan_residential:
 *               summary: Manhattan residential building
 *               value:
 *                 bbl: "1012340456"
 *             brooklyn_multifamily:
 *               summary: Brooklyn multi-family building
 *               value:
 *                 bbl: "3012340789"
 *             queens_apartment:
 *               summary: Queens apartment building
 *               value:
 *                 bbl: "4012340123"
 *     responses:
 *       200:
 *         description: Unit breakdown analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnitBreakdownResult'
 *             examples:
 *               complete_analysis:
 *                 summary: Complete unit breakdown analysis
 *                 value:
 *                   algorithm: "llm-based"
 *                   notes: "Building analysis for R6 class building from 1925..."
 *                   graphVersion: "1.0.0"
 *                   runTimestamp: "2024-01-15T10:30:00.000Z"
 *                   unitBreakdown:
 *                     studio: 6
 *                     one_bed: 10
 *                     two_bed: 6
 *                     three_plus: 2
 *                     source: "AI-Assumed"
 *                   ptacUnits: 54
 *                   numberOfBedrooms: 40
 *                   annualBuildingMMBtuCoolingPTAC: 2469.12
 *                   annualBuildingMMBtuHeatingPTAC: 5100.00
 *                   annualBuildingMMBtuTotalPTAC: 7569.12
 *                   annualBuildingMMBtuHeatingPTHP: 2401.00
 *                   annualBuildingMMBtuCoolingPTHP: 2469.12
 *                   annualBuildingMMBtuTotalPTHP: 4870.12
 *                   energyReductionPercentage: 35.67
 *                   totalRetrofitCost: 136400.00
 *                   annualBuildingThermsHeatingPTAC: 51000.00
 *                   annualBuildingkWhCoolingPTAC: 320000.00
 *                   annualBuildingkWhHeatingPTHP: 42857.14
 *                   annualBuildingkWhCoolingPTHP: 320000.00
 *                   annualBuildingCostPTAC: 154000.00
 *                   annualBuildingCostPTHP: 90714.28
 *                   annualEnergySavings: 63285.72
 *                   capRate: "5.5"
 *                   buildingValue: "1000000"
 *                   siteEUI: "78.5"
 *                   occupancyRate: "95"
 *                   maintenanceCost: "75000"
 *                   energyProfile: '{"electric": "60%", "gas": "40%"}'
 *       400:
 *         description: Invalid BBL format or missing required parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missing_bbl:
 *                 summary: Missing BBL parameter
 *                 value:
 *                   error: "BBL is required"
 *               invalid_format:
 *                 summary: Invalid BBL format
 *                 value:
 *                   error: "BBL must be exactly 10 digits"
 *       422:
 *         description: BBL not found or no PLUTO data available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               no_pluto_data:
 *                 summary: No PLUTO data found
 *                 value:
 *                   error: "No PLUTO data found for BBL"
 *               bbl_invalid:
 *                 summary: BBL does not exist
 *                 value:
 *                   error: "Invalid BBL - no building data found"
 *       500:
 *         description: Internal server error during analysis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               analysis_failed:
 *                 summary: Unit breakdown analysis failed
 *                 value:
 *                   error: "Failed to analyze building unit breakdown"
 *               api_error:
 *                 summary: External API error
 *                 value:
 *                   error: "Internal server error"
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bbl } = body;

    // Validate BBL input
    if (!bbl) {
      return NextResponse.json(
        { error: 'BBL is required' },
        { status: 400 }
      );
    }

    // Validate BBL format (should be exactly 10 digits)
    const cleanBbl = bbl.replace(/[^0-9]/g, '');
    if (cleanBbl.length !== 10) {
      return NextResponse.json(
        { error: 'BBL must be exactly 10 digits' },
        { status: 400 }
      );
    }

    console.log(`Analyzing unit breakdown for BBL: ${cleanBbl}`);

    // Fetch PLUTO data (required)
    console.log(`Fetching PLUTO data for BBL: ${cleanBbl}`);
    const plutoData = await getPlutoDataByBbl(cleanBbl);
    if (!plutoData) {
      console.warn(`No PLUTO data found for BBL: ${cleanBbl}`);
      return NextResponse.json(
        { error: 'No PLUTO data found for BBL' },
        { status: 422 }
      );
    }
    console.log('PLUTO data retrieved successfully');

    // Fetch LL84 data (optional)
    console.log(`Fetching LL84 data for BBL: ${cleanBbl}`);
    const ll84Data = await getLocalLaw84DataByBbl(cleanBbl);
    console.log('LL84 data retrieved successfully');

    // Map PlutoData to PlutoRecord format
    const plutoRecord: PlutoRecord = {
      bldgclass: plutoData.bldgclass,
      resarea: plutoData.resarea,
      unitsres: plutoData.unitsres,
      unitstotal: plutoData.unitstotal,
      boro: plutoData.borough, // Map borough to boro
      lotarea: plutoData.lotarea,
      bldgarea: plutoData.bldgarea,
      yearbuilt: plutoData.yearbuilt,
      landuse: plutoData.landuse,
      numfloors: plutoData.numfloors,
      lotdepth: plutoData.lotdepth,
      lotfront: plutoData.lotfront,
      zip: plutoData.zip,
      address: plutoData.address,
      zone: plutoData.zone || plutoData.zonedist1,
      ownername: plutoData.ownername,
    };

    // Run building analysis
    console.log('Running building analysis on PLUTO and LL84 data');
    const analysisResult = await unitBreakdownService.analyzeBuilding(
      plutoRecord,
      ll84Data || undefined,
    );
    console.log('Building analysis completed successfully');

    // Add metadata
    const finalResult = {
      ...analysisResult,
      graphVersion: '1.0.0',
      runTimestamp: new Date().toISOString(),
    };

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error('Error analyzing BBL unit breakdown:', error);
    
    // Handle specific error cases
    if ((error as Error).message === 'No PLUTO data found for BBL') {
      return NextResponse.json(
        { error: 'No PLUTO data found for BBL' },
        { status: 422 }
      );
    }
    
    if ((error as Error).message.includes('Invalid BBL') || 
        (error as Error).message.includes('BBL must be')) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }

    // Handle unit breakdown analysis failures
    if ((error as Error).message.includes('Failed to analyze building') ||
        (error as Error).message.includes('Graph execution')) {
      return NextResponse.json(
        { error: 'Failed to analyze building unit breakdown' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}