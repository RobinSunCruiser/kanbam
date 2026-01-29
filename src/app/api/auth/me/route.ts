import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types/api';
import { UserAuth } from '@/types/user';
import { UnauthorizedError } from '@/lib/utils/errors';

export async function GET() {
  try {
    const user = await requireAuth();

    return NextResponse.json<ApiResponse<{ user: UserAuth }>>({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
