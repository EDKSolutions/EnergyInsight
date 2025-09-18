import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';

interface UserSyncDto {
  cognitoId: string;
  email: string;
}

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {

    const userData: UserSyncDto = await request.json();
    console.log('userData', userData);

    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '') || '';

    const user = await authService.syncUser(
      userData.cognitoId,
      userData.email,
      apiKey,
    );

    return NextResponse.json({
      message: 'User synced successfully',
      user
    });

  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}