# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Setup
```bash
npm install                  # Install dependencies (runs prisma generate postinstall)
npx prisma migrate dev       # Run database migrations
npx prisma db seed          # Seed database (if seeder exists)
```

### Development
```bash
npm run dev                 # Start Next.js dev server with Turbopack
npm run build              # Production build
npm run start              # Start production server
npm run lint               # Run ESLint
```

### Database
```bash
npx prisma generate        # Regenerate Prisma client (after schema changes)
npx prisma migrate dev     # Create and apply new migration
npx prisma studio          # Open Prisma Studio GUI
```

## Architecture Overview

### Core Stack
- **Next.js 15 App Router**: File-based routing with React Server Components
- **tRPC 11**: Type-safe API layer with React Query integration
- **Prisma ORM**: PostgreSQL database with custom output path at `src/generated/prisma`
- **Clerk**: Authentication with middleware-based protection
- **Inngest**: Background job processing with agent-based code generation
- **E2B**: Sandboxed code execution environment

### Key Architectural Patterns

#### 1. Module-Based Organization
Feature modules live in `src/modules/` and follow a consistent structure:
- `server/procedures.ts`: tRPC procedures (queries/mutations)
- Each module exports a router that gets composed into the main `appRouter`

**Modules:**
- `messages`: Message CRUD operations
- `projects`: Project management and creation
- `usage`: Usage tracking and credit consumption

#### 2. tRPC Architecture
- **Router**: `src/trpc/routers/_app.ts` composes all module routers
- **Context**: `src/trpc/init.ts` creates context with Clerk auth
- **Procedures**:
  - `baseProcedure`: Unauthenticated procedures
  - `protectedProcedure`: Requires authentication via `isAuthed` middleware
- **HTTP Handler**: `src/app/api/trpc/[trpc]/route.ts`
- **Transformer**: Uses `superjson` for Date/Map/Set serialization

#### 3. Inngest Background Jobs
The platform uses Inngest for asynchronous code generation:

**Flow:**
1. User creates project via `projects.create` mutation
2. Mutation sends `code-agent/run` event to Inngest
3. `codeAgentFunction` in `src/inngest/functions.ts`:
   - Creates E2B sandbox (`pluffy-nextjs-test-2` template)
   - Fetches last 5 project messages for context
   - Runs AI agent with Gemini 2.0 Flash
   - Agent uses tools: `terminal`, `createOrUpdateFiles`, `readFiles`
   - Generates fragment title and response via separate agents
   - Saves result as Message with Fragment relation
4. Sandbox URL returned for preview

**Key Files:**
- `src/inngest/client.ts`: Inngest client instance
- `src/inngest/functions.ts`: Agent function implementation
- `src/inngest/utils.ts`: Helper functions (getSandbox, etc.)
- `src/app/api/inngest/route.ts`: HTTP endpoint

#### 4. Authentication Flow
- Clerk middleware in `src/middleware.ts` protects routes
- Public routes: `/`, `/sign-in/*`, `/sign-up/*`, `/api/*`, `/pricing`
- All other routes require authentication
- tRPC context includes Clerk auth object
- Usage tracking checks for `plan:pro` role via `auth().has()`

#### 5. Database Schema
**Models:**
- `Project`: Belongs to user, has many messages
- `Message`: Belongs to project, has optional fragment
  - `role`: USER | ASSISTANT
  - `type`: RESULT | ERROR
- `Fragment`: One-to-one with message, stores sandbox URL, title, and files (JSON)
- `Usage`: Tracks rate limiting by user key

**Important:** Prisma client is generated to `src/generated/prisma/` for edge compatibility. Import from `@/lib/db` which wraps the generated client.

#### 6. Usage & Rate Limiting
- Uses `rate-limiter-flexible` with Prisma storage
- Free tier: 2 points per 30 days
- Pro tier: 100 points per 30 days
- Each generation costs 1 point
- Functions in `src/lib/usage.ts`:
  - `getUsageTracker()`: Creates limiter based on user plan
  - `consumeCredits()`: Consumes credits, throws if exhausted
  - `getUsageStatus()`: Returns current usage

## Environment Variables Required

See `.env.example` for a complete template.

```bash
# Database
DATABASE_URL                          # PostgreSQL connection string

# AI & Sandboxing
GEMINI_API_KEY                        # Google Gemini API key for AI code generation
E2B_API_KEY                          # E2B API key for sandboxed code execution

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY    # Clerk public key
CLERK_SECRET_KEY                      # Clerk secret key

# Background Jobs (Inngest)
INNGEST_EVENT_KEY                     # Inngest event key (auto-set by Vercel integration)
INNGEST_SIGNING_KEY                   # Inngest signing key (auto-set by Vercel integration)

# Application
NEXT_PUBLIC_APP_URL                   # App URL (http://localhost:3000 for dev)
```

### Local Development
For local development, `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` can be omitted. The Inngest dev server will work without them.

### Production Deployment
For Vercel deployment, install the [Inngest Vercel Integration](https://vercel.com/integrations/inngest) which automatically sets `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`. See `DEPLOYMENT.md` for detailed instructions.

## Important Notes

### Prisma Client Location
The Prisma client is generated to `src/generated/prisma/` instead of the default `node_modules/.prisma/client`. Always import the db instance from `@/lib/db`, never import `@prisma/client` directly.

### ESLint Configuration
The ESLint config ignores the `generated/` directory. If you modify `eslint.config.mjs`, ensure generated files remain ignored.

### Webpack Configuration
The `next.config.ts` includes a custom webpack rule to ignore TypeScript declaration files (`.d.ts`) using `ignore-loader`. This prevents bundling issues with declaration files.

### AI Agent Prompts
Agent system prompts are stored in `src/prompt.ts`:
- `PROMPT`: Main coding agent instructions
- `FRAGMENT_TITLE_PROMPT`: Fragment title generation
- `RESPONSE_PROMPT`: User-facing response generation

### E2B Sandbox
The application uses E2B sandboxes with the template `pluffy-nextjs-test-2`. Sandboxes are created per-generation and expose port 3000 for preview.

### Route Groups
- `(home)`: Public-accessible landing, sign-in, sign-up, pricing pages
- `projects/[projectId]`: Dynamic project view (protected)

## Deployment to Vercel

For detailed deployment instructions, see `DEPLOYMENT.md`.

### Quick Start

1. Deploy your application to Vercel
2. **CRITICAL**: Install the [Inngest Vercel Integration](https://vercel.com/integrations/inngest)
   - This automatically configures `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`
   - Without this integration, background jobs will not work in production
3. Configure all other environment variables in Vercel dashboard
4. Redeploy after adding environment variables

### Common Deployment Issues

**Inngest not working on Vercel**: Install the Inngest Vercel Integration. This is the most common cause of deployment failures. The integration automatically syncs your functions and sets required environment variables.

**Database connection errors**: Ensure `DATABASE_URL` includes proper SSL configuration (e.g., `sslmode=require` for Neon).

**Build failures**: Verify that `postinstall` script in `package.json` runs successfully and that all dependencies are properly installed.
