# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Environment Setup

This project requires a Neon PostgreSQL database. Environment variables:

1. Copy [.env.example](.env.example) to `.env.local`
2. Set `DATABASE_URL` to your Neon PostgreSQL connection string
3. Set `JWT_SECRET` to a secure random string (minimum 32 characters)

The database schema is automatically initialized on first connection via [src/lib/storage/db.ts](src/lib/storage/db.ts).

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router (Server Components by default)
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: JWT tokens in httpOnly cookies, bcrypt for password hashing
- **Validation**: Zod schemas
- **Drag & Drop**: @dnd-kit
- **Styling**: Tailwind CSS v4

### Directory Structure

```
src/
├── app/
│   ├── (auth)/              # Public auth routes: login, signup
│   ├── (protected)/         # Protected routes: dashboard, board/[uid]
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   ├── auth/                # Login/Signup forms
│   ├── board/               # Board UI: Board, Column, Card, CardModal
│   ├── dashboard/           # Dashboard UI: BoardList, BoardCard
│   └── ui/                  # Reusable components: Button, Input, Modal
├── lib/
│   ├── actions/             # Server Actions (boards.ts, cards.ts, auth.ts)
│   ├── auth/                # Auth logic: middleware, session, password
│   ├── storage/             # Data layer: db.ts, boards.ts, users.ts
│   ├── utils/               # Utilities: uid.ts, errors.ts
│   ├── validation/          # Zod schemas
│   ├── constants.ts         # App constants
│   └── env.ts               # Environment validation
└── types/                   # TypeScript definitions
```

### Layered Architecture

The codebase follows a clean separation of concerns:

1. **Data Layer** ([src/lib/storage/](src/lib/storage/)): Database queries and business logic
   - [db.ts](src/lib/storage/db.ts): Raw SQL queries using Neon serverless driver
   - [boards.ts](src/lib/storage/boards.ts): Board CRUD and business logic (createBoard, updateCard, etc.)
   - [users.ts](src/lib/storage/users.ts): User operations

2. **Auth Layer** ([src/lib/auth/](src/lib/auth/)): Authentication and authorization
   - [session.ts](src/lib/auth/session.ts): JWT token creation, verification, cookie management
   - [middleware.ts](src/lib/auth/middleware.ts): `requireAuth()`, `requireBoardAccess()`
   - [password.ts](src/lib/auth/password.ts): bcrypt hashing and verification

3. **Server Actions** ([src/lib/actions/](src/lib/actions/)): Form submission handlers
   - All actions follow pattern: validate input → check auth → call storage layer → revalidate paths
   - Use Zod schemas from [validation/schemas.ts](src/lib/validation/schemas.ts)
   - Return `{ success: boolean; error?: string }` for error handling

4. **UI Layer** ([src/components/](src/components/)): Presentational components
   - Server Components by default
   - Client Components (use client directive) only for interactivity
   - Forms use Server Actions with progressive enhancement

### Database Schema

**users table**:
- `id` (TEXT, primary key) - nanoid
- `email` (TEXT, unique) - case-insensitive lookups
- `name` (TEXT)
- `password_hash` (TEXT) - bcrypt with 10 rounds
- `created_at` (TIMESTAMPTZ)

**boards table**:
- `uid` (TEXT, primary key) - nanoid
- `title` (TEXT)
- `owner_id` (TEXT) - references users.id
- `data` (JSONB) - stores members, columns, cards
- `created_at`, `updated_at` (TIMESTAMPTZ)
- GIN index on `data->'members'` for fast member lookups

### Board Data Structure

Boards store structured data in JSONB:
- `members`: Array of `{ email, privilege: 'read'|'write' }`
- `columns`: Three columns (todo, in-progress, done) with `cardIds` array
- `cards`: Record<cardId, Card> for O(1) lookups

Card operations (add, update, move, delete) maintain referential integrity between `cards` and `columns[].cardIds`.

### Authentication Flow

1. Login/Signup → password verified/hashed → JWT token created → stored in httpOnly cookie
2. Protected routes/actions → `requireAuth()` → verifies JWT → returns UserAuth object
3. Board operations → `requireBoardAccess(user, boardUid, 'read'|'write')` → checks membership
4. Logout → cookie cleared via `clearTokenCookie()`

Security features:
- httpOnly cookies prevent XSS attacks
- SameSite=strict prevents CSRF
- Board UIDs validated with `isValidUid()` to prevent path traversal
- All passwords hashed with bcrypt (never stored plaintext)

### Key Patterns

**Server Actions Pattern**:
```typescript
export async function myAction(formData: FormData) {
  // 1. Extract and validate input
  const validation = mySchema.safeParse(rawData);
  if (!validation.success) return { success: false, error: '...' };

  // 2. Check authentication/authorization
  const user = await requireAuth();
  await requireBoardAccess(user, boardUid, 'write');

  // 3. Perform operation
  await storageOperation(validation.data);

  // 4. Revalidate affected paths
  revalidatePath('/dashboard');

  return { success: true };
}
```

**Error Handling**:
- Custom errors in [lib/utils/errors.ts](src/lib/utils/errors.ts): `NotFoundError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`
- All have `statusCode` property for HTTP responses
- Storage layer throws errors, Server Actions catch and return `{ success: false, error }`

**UID Generation**:
- All IDs use nanoid (21 chars, URL-safe) via [lib/utils/uid.ts](src/lib/utils/uid.ts)
- Validation: `isValidUid()` checks format before database queries

### Board Access Control

Authorization rules:
- Board **owner** (ownerId): Full control, cannot be removed by others
- **Write** members: Can modify board, add/remove cards, invite members, remove others (except owner)
- **Read** members: View-only access
- Users can remove themselves from any board (leave board)
- If last member leaves, board is automatically deleted

### Route Groups

- `(auth)`: Public routes for unauthenticated users (login, signup)
- `(protected)`: Requires authentication, layout includes navbar with logout
- Protected layout checks session and redirects to login if not authenticated

### Component Organization

**Client vs Server Components**:
- Use Server Components by default (better performance, smaller bundle)
- Client Components only when needed: forms with state, drag-and-drop, modals
- Server Actions work with both (progressive enhancement)

**Board UI**:
- [BoardWrapper](src/components/board/BoardWrapper.tsx): Server Component, fetches board data
- [Board](src/components/board/Board.tsx): Client Component, handles drag-and-drop with @dnd-kit
- [Card](src/components/board/Card.tsx): Optimistic UI updates with Server Actions

## Common Patterns

When adding features:
1. Define types in [src/types/](src/types/)
2. Add Zod validation schema if needed in [lib/validation/schemas.ts](src/lib/validation/schemas.ts)
3. Implement storage logic in [lib/storage/](src/lib/storage/)
4. Create Server Action in [lib/actions/](src/lib/actions/)
5. Build UI components in [src/components/](src/components/)
6. Call Server Actions from forms/buttons with progressive enhancement

When modifying board data:
- Always update `board.updatedAt = new Date().toISOString()`
- Call `saveBoard(board)` to persist changes
- Use `revalidatePath()` in Server Actions to refresh UI

When working with authentication:
- Protected operations: Always call `requireAuth()` first
- Board operations: Call `requireBoardAccess()` with required privilege level
- Use `UserAuth` type (excludes passwordHash) for authenticated user data