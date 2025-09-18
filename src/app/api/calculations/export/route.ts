import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../auth/middleware';
import { getUserCalculations } from '@/lib/services/calculations';
import { calculationsToCSV, generateCSVFilename } from '@/lib/utils/csv-export';

/**
 * @swagger
 * /api/calculations/export:
 *   get:
 *     tags:
 *       - Calculations
 *     summary: Export all user calculations as CSV
 *     description: |
 *       Exports all energy calculations for the authenticated user as a CSV file.
 *       Returns a downloadable CSV containing all calculation fields including:
 *       - Building characteristics and identifiers
 *       - Energy consumption and savings data (PTAC vs PTHP)
 *       - LL97 compliance data (emissions, budgets, fees)
 *       - Financial analysis (retrofit costs, payback, loan details)
 *       - NOI and property value projections
 *       - Configuration settings and metadata
 *
 *       The CSV includes both raw numeric values and flattened JSON fields for
 *       comprehensive analysis in external tools like Excel, R, or Python.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [basic, detailed]
 *           default: detailed
 *         description: Export format - 'basic' excludes JSON fields, 'detailed' includes all fields
 *       - in: query
 *         name: dateFormat
 *         schema:
 *           type: string
 *           enum: [iso, us, short]
 *           default: iso
 *         description: Date format for timestamps
 *       - in: query
 *         name: precision
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *           default: 2
 *         description: Decimal precision for floating point numbers
 *     responses:
 *       200:
 *         description: CSV file generated successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *             example: |
 *               id,bbl,address,boro,yearBuilt,stories,buildingClass,totalSquareFeet...
 *               a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6,1012340456,123 MAIN STREET,MANHATTAN,1925,6,R6,12500.00...
 *         headers:
 *           Content-Type:
 *             schema:
 *               type: string
 *               example: text/csv; charset=utf-8
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: attachment; filename="calculations-export-2024-01-15-14-30-25.csv"
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
 *               error: "Failed to generate CSV export"
 */

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'detailed';
    const dateFormat = url.searchParams.get('dateFormat') || 'iso';
    const precision = parseInt(url.searchParams.get('precision') || '2', 10);

    // Validate parameters
    if (!['basic', 'detailed'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format parameter. Must be "basic" or "detailed"' },
        { status: 400 }
      );
    }

    if (!['iso', 'us', 'short'].includes(dateFormat)) {
      return NextResponse.json(
        { error: 'Invalid dateFormat parameter. Must be "iso", "us", or "short"' },
        { status: 400 }
      );
    }

    if (precision < 0 || precision > 6) {
      return NextResponse.json(
        { error: 'Invalid precision parameter. Must be between 0 and 6' },
        { status: 400 }
      );
    }

    // Fetch user calculations
    const userCalculations = await getUserCalculations(user.userId);

    // Extract the calculation objects from the nested structure
    const calculations = userCalculations.map(uc => uc.calculation);

    // Generate CSV content
    const csvOptions = {
      includeJsonFields: format === 'detailed',
      dateFormat: dateFormat as 'iso' | 'us' | 'short',
      floatPrecision: precision
    };

    const csvContent = calculationsToCSV(calculations, csvOptions);

    // Generate filename
    const filename = generateCSVFilename('calculations-export');

    // Return CSV file
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

    return response;

  } catch (error) {
    console.error('Error generating CSV export:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV export' },
      { status: 500 }
    );
  }
}