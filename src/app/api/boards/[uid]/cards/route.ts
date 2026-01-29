import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireBoardAccess } from '@/lib/auth/middleware';
import { addCard } from '@/lib/storage/boards';
import { ApiResponse } from '@/types/api';
import { Card, ColumnType } from '@/types/board';
import { UnauthorizedError, ForbiddenError, ValidationError } from '@/lib/utils/errors';

// POST /api/boards/[uid]/cards - Create a new card
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const user = await requireAuth();
    await requireBoardAccess(user, uid, 'write');

    const body = await request.json();
    const { title, description, columnId } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!columnId || !['todo', 'in-progress', 'done'].includes(columnId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Valid columnId is required (todo, in-progress, done)' },
        { status: 400 }
      );
    }

    const card = await addCard(uid, {
      title: title.trim(),
      description: description?.trim(),
      columnId: columnId as ColumnType,
    });

    return NextResponse.json<ApiResponse<{ card: Card }>>(
      { success: true, data: { card } },
      { status: 201 }
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

    console.error('Create card error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
