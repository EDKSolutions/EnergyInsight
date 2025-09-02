import { NextRequest, NextResponse } from 'next/server';
import { fetchBblNumber } from '@/lib/services/geo-client';
import { getUserFromRequest } from '../../auth/middleware';

/**
 * @swagger
 * /api/geo-client/address:
 *   get:
 *     tags:
 *       - GeoClient
 *     summary: Get BBL number from address (Query Parameters)
 *     description: |
 *       Resolves a NYC address to its Building Block and Lot (BBL) number using NYC GeoClient API.
 *       BBL numbers are unique identifiers for NYC properties required for PLUTO data lookup.
 *       Supports all five NYC boroughs: Manhattan, Brooklyn, Queens, Bronx, Staten Island.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: houseNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Street number of the building
 *         example: "123"
 *       - in: query
 *         name: street
 *         required: true
 *         schema:
 *           type: string
 *         description: Street name
 *         example: "Main Street"
 *       - in: query
 *         name: borough
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Manhattan, Brooklyn, Queens, Bronx, "Staten Island"]
 *         description: NYC borough name
 *         example: "Manhattan"
 *       - in: query
 *         name: zip
 *         required: false
 *         schema:
 *           type: string
 *         description: ZIP code (optional, improves accuracy)
 *         example: "10001"
 *     responses:
 *       200:
 *         description: BBL number resolved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bbl:
 *                   type: string
 *                   description: NYC Building Block and Lot number
 *                   example: "1012340456"
 *               required: [bbl]
 *             examples:
 *               manhattan_bbl:
 *                 summary: Manhattan building BBL
 *                 value:
 *                   bbl: "1012340456"
 *               brooklyn_bbl:
 *                 summary: Brooklyn building BBL
 *                 value:
 *                   bbl: "3098760123"
 *               queens_bbl:
 *                 summary: Queens building BBL
 *                 value:
 *                   bbl: "4154320789"
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Missing required parameters: houseNumber, street, borough"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: BBL not found for the provided address
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "BBL not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 *   post:
 *     tags:
 *       - GeoClient
 *     summary: Get BBL number from address (Request Body)
 *     description: |
 *       Alternative endpoint to resolve NYC address to BBL number using request body.
 *       Provides the same functionality as the GET endpoint but accepts parameters in JSON format.
 *       Useful for complex address data or when GET URL length limits are a concern.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               houseNumber:
 *                 type: string
 *                 description: Street number of the building
 *                 example: "123"
 *               street:
 *                 type: string
 *                 description: Street name
 *                 example: "Main Street"
 *               borough:
 *                 type: string
 *                 enum: [Manhattan, Brooklyn, Queens, Bronx, "Staten Island"]
 *                 description: NYC borough name
 *                 example: "Manhattan"
 *               zip:
 *                 type: string
 *                 description: ZIP code (optional)
 *                 example: "10001"
 *             required: [houseNumber, street, borough]
 *           examples:
 *             manhattan_address:
 *               summary: Manhattan address lookup
 *               value:
 *                 houseNumber: "123"
 *                 street: "Main Street"
 *                 borough: "Manhattan"
 *                 zip: "10001"
 *             brooklyn_address:
 *               summary: Brooklyn address lookup
 *               value:
 *                 houseNumber: "456"
 *                 street: "Oak Avenue"
 *                 borough: "Brooklyn"
 *                 zip: "11201"
 *             queens_address_no_zip:
 *               summary: Queens address without ZIP
 *               value:
 *                 houseNumber: "789"
 *                 street: "Elm Street"
 *                 borough: "Queens"
 *             bronx_address:
 *               summary: Bronx address lookup
 *               value:
 *                 houseNumber: "321"
 *                 street: "Grand Concourse"
 *                 borough: "Bronx"
 *                 zip: "10451"
 *             staten_island_address:
 *               summary: Staten Island address lookup
 *               value:
 *                 houseNumber: "654"
 *                 street: "Richmond Avenue"
 *                 borough: "Staten Island"
 *                 zip: "10314"
 *     responses:
 *       200:
 *         description: BBL number resolved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bbl:
 *                   type: string
 *                   description: NYC Building Block and Lot number
 *                   example: "1012340456"
 *               required: [bbl]
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Missing required parameters: houseNumber, street, borough"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: BBL not found for the provided address
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "BBL not found"
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

    const { searchParams } = new URL(request.url);
    const houseNumber = searchParams.get('houseNumber');
    const street = searchParams.get('street');
    const borough = searchParams.get('borough');
    const zip = searchParams.get('zip');

    if (!houseNumber || !street || !borough) {
      return NextResponse.json(
        { error: 'Missing required parameters: houseNumber, street, borough' },
        { status: 400 }
      );
    }

    const bbl = await fetchBblNumber({
      houseNumber,
      street,
      borough,
      zip: zip || undefined,
    });

    if (!bbl) {
      return NextResponse.json({ error: 'BBL not found' }, { status: 404 });
    }

    return NextResponse.json({ bbl });
  } catch (error) {
    console.error('Error in geo-client API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { houseNumber, street, borough, zip } = body;

    if (!houseNumber || !street || !borough) {
      return NextResponse.json(
        { error: 'Missing required parameters: houseNumber, street, borough' },
        { status: 400 }
      );
    }

    const bbl = await fetchBblNumber({
      houseNumber,
      street,
      borough,
      zip,
    });

    if (!bbl) {
      return NextResponse.json({ error: 'BBL not found' }, { status: 404 });
    }

    return NextResponse.json({ bbl });
  } catch (error) {
    console.error('Error in geo-client API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}