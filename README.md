# KanBam

A collaborative Kanban board application built with Next.js, TypeScript, and PostgreSQL.

## Features

- **Drag-and-drop boards** -- Create unlimited boards with custom columns and cards powered by @dnd-kit
- **Collaboration** -- Invite team members with granular read/write access control
- **Rich cards** -- Descriptions, checklists, links, deadlines, and user assignment
- **Real-time sync** -- Live board updates across all connected users via Server-Sent Events
- **Authentication** -- JWT-based auth with email verification and password reset
- **Internationalization** -- English and German (extensible via next-intl)
- **Responsive design** -- Works on desktop, tablet, and mobile with dark mode support

## Tech Stack

| Category       | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Next.js 16 (App Router)            |
| Language       | TypeScript (strict mode)            |
| Styling        | Tailwind CSS v4                     |
| Database       | PostgreSQL (Neon serverless)        |
| Authentication | JWT (jose) + bcrypt                 |
| Drag & Drop    | @dnd-kit                            |
| Validation     | Zod                                 |
| Email          | Resend                              |
| i18n           | next-intl                           |

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (e.g. [Neon](https://neon.tech))

### Setup

```bash
git clone <repo-url>
cd kanbam
npm install
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=<random-string-min-32-chars>
RESEND_API_KEY=re_your_key
EMAIL_FROM_NAME=KanBam
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── [locale]/               # Locale-prefixed routes (en, de)
│   │   ├── (auth)/             # Login, signup, password reset
│   │   ├── (protected)/        # Dashboard, board view
│   │   └── (public)/           # Public pages
│   └── api/                    # SSE endpoint for real-time sync
├── components/
│   ├── board/                  # Board, Column, Card, CardModal
│   ├── dashboard/              # Board list, create board
│   ├── auth/                   # Auth forms
│   └── ui/                     # Shared UI components
├── lib/
│   ├── actions/                # Server actions (auth, boards, columns, cards)
│   ├── auth/                   # JWT session, password hashing, middleware
│   ├── storage/                # Database queries (Neon PostgreSQL)
│   ├── email/                  # Email dispatch and token management
│   ├── hooks/                  # Custom React hooks (sync, inline edit)
│   ├── realtime/               # SSE event emitter
│   ├── validation/             # Zod schemas
│   └── utils/                  # UID, dates, errors, classnames
├── types/                      # TypeScript type definitions
├── i18n/                       # Internationalization config
└── messages/                   # Translation files (en.json, de.json)
```

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International** license. See [LICENSE](LICENSE) for details.
