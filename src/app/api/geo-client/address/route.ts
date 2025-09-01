import { NextRequest, NextResponse } from 'next/server';
import { fetchBblNumber } from '@/lib/services/geo-client';
import { getUserFromRequest } from '../../auth/middleware';

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