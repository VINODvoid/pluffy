## Pluffy

Pluffy AI is a platform that enables users to build web applications from a prompt. It provides a modern developer experience with authentication, type-safe APIs, database integration, background jobs, and a clean component architecture. The application includes features for managing projects and messages, usage tracking, and supports rapid development with a robust tech stack.

### Screenshots

Signed-out landing

![Landing (Signed Out)](public/landing-page-without-sign-in.png)

Signed-in landing

![Landing (Signed In)](public/landing-page-with-sign-in.png)

### Features
- **Next.js App Router (15)**: File-based routing, server components, edge-ready.
- **Type-safe APIs with tRPC**: End-to-end types using `@trpc/server` and React Query.
- **Authentication with Clerk**: Drop-in sign-in/sign-up flows and user management.
- **Database with Prisma**: PostgreSQL via Prisma schema and migrations.
- **Background jobs with Inngest**: Event-driven functions for async work.
- **UI with shadcn/ui + Radix**: Accessible components and utility-first styling.
- **Usage tracking**: Basic metering primitives for projects.

### Tech Stack
- Next.js, React 19
- TypeScript
- Tailwind CSS v4
- tRPC 11 + @tanstack/react-query 5
- Prisma ORM
- Clerk (auth)
- Inngest (jobs)

## Getting Started

### Prerequisites
- Node.js 18+ (recommended 20+)
- A PostgreSQL database (local or hosted)

### 1) Clone and install
```bash
git clone <your-fork-or-repo-url> pluffy
cd pluffy
npm install
```

### 2) Environment variables
Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"

# Clerk (replace with your values)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Inngest (optional if you run locally without external triggers)
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3) Database setup
Generate Prisma client (done automatically on install) and run migrations:

```bash
npx prisma migrate dev
```

Optionally seed data (if you add a seeder):

```bash
npx prisma db seed
```

### 4) Start the dev server
```bash
npm run dev
```

Visit `http://localhost:3000`.

## Scripts
- `npm run dev`: Start Next.js in development
- `npm run build`: Production build
- `npm run start`: Start production server
- `npm run lint`: Lint

## Project Structure
```text
src/
  app/                         # App Router pages and routes
  components/                  # Reusable UI components (incl. shadcn/ui)
  generated/prisma/            # Generated Prisma client (committed for edge)
  hooks/                       # Client hooks
  inngest/                     # Inngest client, functions, utils
  lib/                         # Server utilities: db, usage, helpers
  modules/                     # Feature modules (home, projects, messages, usage)
  trpc/                        # tRPC router, client, server wiring
  types.ts                     # Shared types
prisma/
  schema.prisma                # Data model
  migrations/                  # Migration history
public/                        # Static assets (including screenshots)
```

## Development Notes
- Prisma client is generated postinstall. If you change `schema.prisma`, re-run `npx prisma generate` and create a migration.
- The `generated/prisma` folder exists to support environments where bundling the Prisma engine is desirable; prefer `@prisma/client` imports exposed there when running at the edge.
- Clerk routes are mounted under `src/app/(home)/sign-in` and `sign-up` segments.
- tRPC HTTP handler is under `src/app/api/trpc/[trpc]/route.ts`.
- Inngest endpoint is under `src/app/api/inngest/route.ts`.

## Deployment
- Works on platforms that support Next.js 15 (e.g., Vercel).
- Ensure all required env vars are set in your host environment.
- Run `npm run build` and `npm run start` for self-hosting.

## License
This project is licensed under the terms of the license in `LICENSE`.

## Acknowledgements
- Built with Next.js and the App Router.
- UI primitives from Radix and shadcn/ui.
- Data layer powered by Prisma.
- Auth by Clerk.
- Background jobs by Inngest.
