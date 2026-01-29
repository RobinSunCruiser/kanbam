import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/storage/users';
import { hashPassword } from '@/lib/auth/password';
import { setTokenCookie } from '@/lib/auth/session';
import { ApiResponse } from '@/types/api';
import { UserAuth } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // Validation
    if (!email || !name || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await createUser({
      email,
      name,
      passwordHash,
      boardAccess: [],
    });

    // Set session cookie
    await setTokenCookie(user.id);

    // Return user (without password hash)
    const userAuth: UserAuth = {
      id: user.id,
      email: user.email,
      name: user.name,
      boardAccess: user.boardAccess,
    };

    return NextResponse.json<ApiResponse<{ user: UserAuth }>>(
      { success: true, data: { user: userAuth } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
