# KanBam

A clean and modern Kanban board implementation built with Next.js 15, TypeScript, and Tailwind CSS. Perfect for personal task management and team collaboration.

## ✨ Features

- **🎯 Drag & Drop** - Intuitive drag-and-drop interface powered by @dnd-kit
- **📊 Multiple Boards** - Create unlimited boards for different projects
- **🔐 User Authentication** - Secure JWT-based authentication with bcrypt
- **👥 Access Control** - Read/write privileges per board for team collaboration
- **💾 File-based Storage** - Simple JSON storage with atomic writes and file locking
- **🎨 Modern UI** - Clean interface with dark mode support via Tailwind CSS
- **🔒 Security First** - httpOnly cookies, password hashing, and authorization checks
- **📱 Responsive** - Works seamlessly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd kanbam
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update the JWT secret in `.env.local`:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
kanbam/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Public auth routes (login, signup)
│   │   ├── (protected)/         # Protected routes (dashboard, boards)
│   │   ├── api/                 # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   └── boards/         # Board & card CRUD endpoints
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── auth/               # Authentication forms
│   │   ├── board/              # Board, Column, Card components
│   │   ├── dashboard/          # Dashboard components
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   ├── auth/               # Auth utilities (JWT, bcrypt)
│   │   ├── storage/            # File storage operations
│   │   └── utils/              # Utilities (UID generation, errors)
│   └── types/                  # TypeScript type definitions
├── data/                       # JSON storage (git-ignored)
│   ├── users.json             # User database
│   └── boards/                # Board files
└── public/                    # Static assets
```

## 🔧 Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Authentication:** JWT (jose) + bcrypt
- **Drag & Drop:** @dnd-kit
- **Storage:** File-based JSON with proper-lockfile
- **ID Generation:** nanoid

## 🎯 How It Works

### Authentication
- JWT tokens stored in httpOnly cookies for security
- Passwords hashed with bcrypt (10 salt rounds)
- Server-side auth checks on protected routes
- Session middleware validates every API request

### Data Storage
- Each board stored as individual JSON file (`data/boards/{uid}.json`)
- Users stored in single file (`data/users.json`)
- File locking prevents concurrent write conflicts
- Atomic writes (temp file + rename) ensure data integrity

### Authorization
- Board access control with Read/Write privileges
- Users can own multiple boards
- Board creators get Write access by default
- Read-only users can view but not modify boards

### Board Structure
- Three columns: To Do, In Progress, Done
- Cards can be dragged between columns
- Each card has title, description, and timestamps
- Optimistic UI updates with server persistence

## 🔐 Security Features

- ✅ Passwords hashed with bcrypt (never stored plain)
- ✅ JWT in httpOnly cookie (prevents XSS)
- ✅ Secure flag in production, SameSite=strict (prevents CSRF)
- ✅ Board UID validation (prevents path traversal)
- ✅ Authorization checks on every API call
- ✅ File paths never exposed to client
- ✅ Data directory outside public folder
- ✅ Input validation on all API endpoints

## 📖 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Boards
- `GET /api/boards` - List user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/[uid]` - Get board details
- `PUT /api/boards/[uid]` - Update board metadata
- `DELETE /api/boards/[uid]` - Delete board (owner only)

### Cards
- `POST /api/boards/[uid]/cards` - Create card
- `PUT /api/boards/[uid]/cards/[cardId]` - Update/move card
- `DELETE /api/boards/[uid]/cards/[cardId]` - Delete card

## 🎨 Architecture Highlights

### Separation of Concerns
- **Storage Layer**: File operations abstracted in `src/lib/storage/`
- **Auth Layer**: Authentication logic in `src/lib/auth/`
- **API Layer**: RESTful routes with clear responsibilities
- **UI Layer**: Presentational components with minimal business logic

### Type Safety
- Full TypeScript coverage
- Shared types across frontend and backend
- Strict mode enabled for maximum safety

### Scalability Path
Current MVP uses file-based storage, but the architecture supports easy migration:
- Replace `src/lib/storage/` implementations
- Keep API routes unchanged
- No changes needed to UI components

## 🚧 Future Enhancements

- [ ] Team invitations via email
- [ ] Assign cards to users
- [ ] Email notifications using Next.js mail system
- [ ] Card labels and tags
- [ ] Due dates and reminders
- [ ] File attachments
- [ ] Comments on cards
- [ ] Activity log
- [ ] Custom column names
- [ ] Board templates
- [ ] Search and filters
- [ ] Real-time collaboration (WebSockets)
- [ ] Database migration (SQLite → PostgreSQL)

## 📝 Development Notes

This project follows Next.js 15 and React 19 best practices:
- Server Components by default for better performance
- Client components only where needed (interactive UI)
- TypeScript for type safety
- Tailwind CSS for consistent styling
- ESLint for code quality

## 📄 License

MIT License - see LICENSE file for details

---

Built with ❤️ using Next.js 15, TypeScript, and modern web technologies.
