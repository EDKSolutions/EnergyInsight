import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../auth/middleware';
import { getCalculationById, modifyCalculation } from '@/lib/services/calculations';

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