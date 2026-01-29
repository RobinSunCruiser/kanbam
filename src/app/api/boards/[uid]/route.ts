import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireBoardAccess } from '@/lib/auth/middleware';
import { loadBoard, updateBoardMetadata, deleteBoard } from '@/lib/storage/boards';
import { ApiResponse } from '@/types/api';
import { Board } from '@/types/board';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '@/lib/utils/errors';

// GET /api/boards/[uid] - Get board details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const user = await requireAuth();
    await requireBoardAccess(user, uid, 'read');

    const board = await loadBoard(uid);
    if (!board) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Board not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<{ board: Board }>>({
      success: true,
      data: { board },
    });
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

    console.error('Get board error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/boards/[uid] - Update board metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const user = await requireAuth();
    await requireBoardAccess(user, uid, 'write');

    const body = await request.json();
    const { title, description } = body;

    const updates: { title?: string; description?: string } = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No updates provided' },
        { status: 400 }
      );
    }

    const board = await updateBoardMetadata(uid, updates);

    return NextResponse.json<ApiResponse<{ board: Board }>>({
      success: true,
      data: { board },
    });
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

    console.error('Update board error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/[uid] - Delete board
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const user = await requireAuth();
    await requireBoardAccess(user, uid, 'write');

    // Check if user is owner
    const board = await loadBoard(uid);
    if (!board) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Board not found' },
        { status: 404 }
      );
    }

    if (board.ownerId !== user.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Only the board owner can delete it' },
        { status: 403 }
      );
    }

    // Delete board (members are stored on board, so they're automatically removed)
    await deleteBoard(uid);

    return NextResponse.json<ApiResponse>({
      success: true,
    });
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

    console.error('Delete board error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
