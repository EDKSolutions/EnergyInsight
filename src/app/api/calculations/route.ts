import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../auth/middleware';
import { createCalculation, getUserCalculations } from '@/lib/services/calculations';

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