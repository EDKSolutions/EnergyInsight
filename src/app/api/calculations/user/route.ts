import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '../../auth/middleware';
import { getUserCalculations } from '@/lib/services/calculations';

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