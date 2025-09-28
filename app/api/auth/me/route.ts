// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { validateAuth } from '@/lib/auth';

export async function GET() {
  try {
    const authResult = await validateAuth();
    
    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: authResult.admin
    });
  } catch (error) {
    console.error('Auth validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

