import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { createBoard, listBoardsByEmail, getBoardMemberPrivilege } from '@/lib/storage/boards';
import { ApiResponse } from '@/types/api';
import { BoardMetadata } from '@/types/board';
import { UnauthorizedError } from '@/lib/utils/errors';

// GET /api/boards - List all boards user has access to
export async function GET() {
  try {
    const user = await requireAuth();

    // Get all boards where user is a member
    const userBoards = await listBoardsByEmail(user.email);

    const boards: BoardMetadata[] = userBoards.map(board => {
      const member = board.members.find(
        m => m.email.toLowerCase() === user.email.toLowerCase()
      );

      return {
        uid: board.uid,
        title: board.title,
        description: board.description,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        cardCount: Object.keys(board.cards).length,
        privilege: member?.privilege || 'read',
      };
    });

    return NextResponse.json<ApiResponse<{ boards: BoardMetadata[] }>>({
      success: true,
      data: { boards },
    });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('List boards error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/boards - Create a new board
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { title, description } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create board with owner as first member
    const board = await createBoard({
      title: title.trim(),
      description: description?.trim(),
      ownerId: user.id,
    }, user.email);

    return NextResponse.json<ApiResponse<{ board: typeof board }>>(
      { success: true, data: { board } },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Create board error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
