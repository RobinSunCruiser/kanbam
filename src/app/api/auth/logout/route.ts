import { NextResponse } from 'next/server';
import { clearTokenCookie } from '@/lib/auth/session';
import { ApiResponse } from '@/types/api';

export async function POST() {
  try {
    await clearTokenCookie();

    return NextResponse.json<ApiResponse>({
      success: true,
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
