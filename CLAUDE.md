# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack expense tracking application built as a monorepo using pnpm workspaces. The project consists of:

- **API (NestJS)**: Backend REST API with PostgreSQL database
- **Web (Next.js)**: Frontend web application with Tailwind CSS and shadcn/ui components

## Development Commands

### Full Stack Development
```bash
pnpm dev              # Start database, API, and web concurrently
pnpm dev:db           # Start PostgreSQL via Docker Compose
pnpm dev:api          # Start NestJS API in watch mode (port 5000)
pnpm dev:web          # Start Next.js web app with Turbopack (port 3000)
```

### API-specific Commands
```bash
pnpm api <command>    # Run API-specific commands
pnpm api build        # Build API for production
pnpm api test         # Run Jest tests
pnpm api test:watch   # Run tests in watch mode
pnpm api test:cov     # Run tests with coverage
pnpm api test:e2e     # Run end-to-end tests
pnpm api lint         # Lint and auto-fix TypeScript files
pnpm api prisma       # Run Prisma CLI commands
```

### Web-specific Commands
```bash
pnpm web <command>    # Run web-specific commands
pnpm web build        # Build web app with Turbopack
pnpm web start        # Start production server
```

### Database Migrations
```bash
# IMPORTANT: Always get authorization before running migrations
pnpm api prisma migrate dev --name <migration_name>    # Create and apply migration
pnpm api prisma migrate deploy                         # Apply pending migrations
pnpm api prisma studio                                 # Open Prisma Studio GUI
pnpm api prisma generate                               # Generate Prisma Client
```

## Architecture

### API Structure (NestJS)

The API follows a modular NestJS architecture with domain-driven modules:

**Core Modules:**
- `auth/`: JWT-based authentication with Passport strategies (local + JWT)
- `users/`: User management and profiles
- `expenses/`: Expense CRUD operations with validation
- `tags/`: Tag management for expense categorization
- `prisma/`: Database service wrapper for Prisma Client

**Key Architecture Patterns:**
- **Global Prefix**: All API routes are prefixed with `/api`
- **Validation**: Global ValidationPipe with `whitelist: true` and `forbidNonWhitelisted: true`
- **Exception Handling**: Custom PrismaClientExceptionFilter for database errors
- **Prisma Client Location**: Generated at `apps/api/generated/prisma` (not default location)
- **Authentication Guards**: JWT guards protect authenticated routes

**Database Schema (Prisma):**
- `User`: Authentication and profile data
- `Expense`: Expense records with amount (stored as cents), title, description, and date
- `Tag`: User-created tags with colors
- `ExpenseTags`: Many-to-many join table for expenses and tags

### Web Structure (Next.js 16)

The web app uses Next.js App Router with a feature-based folder structure:

**Route Groups:**
- `(auth)/`: Protected routes (dashboard, expenses, tags, settings)
- `(noAuth)/`: Unauthenticated routes (login, sign-up)
- `(public)/`: Public routes (landing page)

**Folder Structure:**
- `features/`: Feature-specific code organized by domain (auth, dashboard, expenses, user)
  - Each feature contains: `api/`, `components/`, `hooks/`, `types/`, `server/`
- `shared/`: Reusable code across features
  - `api/`: API client functions
  - `components/`: Shared UI components (including shadcn/ui)
  - `hooks/`: Custom React hooks
  - `lib/`: Utility functions
  - `providers/`: Context providers

**Key Implementation Details:**
- **Authentication**: Cookie-based using `authToken` cookie
- **Middleware**: `proxy.ts` exports middleware function for route protection
- **Path Alias**: `@/*` maps to `src/*` for imports
- **UI Library**: shadcn/ui components with Tailwind CSS v4
- **State Management**: Zustand for client state
- **Styling**: Tailwind CSS with PostCSS, class-variance-authority for component variants

### API-Web Integration

- Web app proxies API requests to `http://localhost:5000/api`
- Authentication via JWT stored in httpOnly cookies
- API routes in web app (`app/api/`) handle server-side API calls and cookie management

## Important Notes

- **Prisma Client Path**: The Prisma client is generated to `apps/api/generated/prisma`, not the default `node_modules/.prisma/client`
- **TypeScript Configuration**: API uses `noImplicitAny: false` (avoid using `any` types per user preferences)
- **Database**: PostgreSQL running in Docker on port 5432 (password: `123456` for dev)
- **Environment Variables**: API uses `.env` file with DATABASE_URL, JWT_SECRET, BCRYPT_SALT_ROUNDS, and PORT
- **Clean Code**: Follow clean code principles and avoid using `any` types in TypeScript
- **Build Tool**: Web app uses Turbopack for faster builds and development
