import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireBoardAccess } from '@/lib/auth/middleware';
import { addBoardMember, removeBoardMember, loadBoard } from '@/lib/storage/boards';
import { ApiResponse } from '@/types/api';
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from '@/lib/utils/errors';

interface RouteContext {
  params: Promise<{ uid: string }>;
}

// POST /api/boards/[uid]/members - Invite a member to the board
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { uid } = await params;
    const user = await requireAuth();

    // Check if user has write access to invite others
    await requireBoardAccess(user, uid, 'write');

    const body = await request.json();
    const { email, privilege } = body;

    if (!email || !email.trim()) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!privilege || (privilege !== 'read' && privilege !== 'write')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Privilege must be "read" or "write"' },
        { status: 400 }
      );
    }

    await addBoardMember(uid, email.trim().toLowerCase(), privilege);

    return NextResponse.json<ApiResponse>(
      { success: true, data: { message: 'Member invited successfully' } },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    console.error('Add member error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/[uid]/members - Remove a member (or leave board)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { uid } = await params;
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const emailToRemove = searchParams.get('email');

    if (!emailToRemove) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Check if user is removing themselves (leaving) or removing someone else
    const isSelf = emailToRemove.toLowerCase() === user.email.toLowerCase();

    if (!isSelf) {
      // Removing someone else requires write access
      await requireBoardAccess(user, uid, 'write');
    }

    // Load board to check if user is the last member
    const board = await loadBoard(uid);
    if (!board) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Board not found' },
        { status: 404 }
      );
    }

    await removeBoardMember(uid, emailToRemove.toLowerCase());

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: isSelf ? 'Left board successfully' : 'Member removed successfully',
          boardDeleted: board.members.length === 1 // Board will be deleted if this was the last member
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    console.error('Remove member error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
