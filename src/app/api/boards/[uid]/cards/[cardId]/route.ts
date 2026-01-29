import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireBoardAccess } from '@/lib/auth/middleware';
import { updateCard, deleteCard as deleteCardFromBoard } from '@/lib/storage/boards';
import { ApiResponse } from '@/types/api';
import { Card, ColumnType } from '@/types/board';
import { UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from '@/lib/utils/errors';

// PUT /api/boards/[uid]/cards/[cardId] - Update card
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string; cardId: string }> }
) {
  try {
    const { uid, cardId } = await params;
    const user = await requireAuth();
    await requireBoardAccess(user, uid, 'write');

    const body = await request.json();
    const { title, description, columnId, order } = body;

    const updates: {
      title?: string;
      description?: string;
      columnId?: ColumnType;
      order?: number;
    } = {};

    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (columnId !== undefined) {
      if (!['todo', 'in-progress', 'done'].includes(columnId)) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Invalid columnId (must be todo, in-progress, or done)' },
          { status: 400 }
        );
      }
      updates.columnId = columnId as ColumnType;
    }
    if (order !== undefined) updates.order = order;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No updates provided' },
        { status: 400 }
      );
    }

    const card = await updateCard(uid, cardId, updates);

    return NextResponse.json<ApiResponse<{ card: Card }>>({
      success: true,
      data: { card },
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

    if (error instanceof ValidationError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.error('Update card error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/[uid]/cards/[cardId] - Delete card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string; cardId: string }> }
) {
  try {
    const { uid, cardId } = await params;
    const user = await requireAuth();
    await requireBoardAccess(user, uid, 'write');

    await deleteCardFromBoard(uid, cardId);

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

    console.error('Delete card error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
