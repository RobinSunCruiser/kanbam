import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/storage/users';
import { verifyPassword } from '@/lib/auth/password';
import { setTokenCookie } from '@/lib/auth/session';
import { ApiResponse } from '@/types/api';
import { UserAuth } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing email or password' },
        { status: 400 }
      );
    }

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Set session cookie
    await setTokenCookie(user.id);

    // Return user (without password hash)
    const userAuth: UserAuth = {
      id: user.id,
      email: user.email,
      name: user.name,
      boardAccess: user.boardAccess,
    };

    return NextResponse.json<ApiResponse<{ user: UserAuth }>>({
      success: true,
      data: { user: userAuth },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
