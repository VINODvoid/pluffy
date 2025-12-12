# Deployment Guide

This guide provides step-by-step instructions for deploying Pluffy to Vercel with Inngest integration.

## Prerequisites

- A [Vercel](https://vercel.com) account
- A [PostgreSQL database](https://neon.tech) (we recommend Neon)
- A [Clerk](https://clerk.com) account for authentication
- A [Gemini API key](https://ai.google.dev) for AI code generation
- An [E2B API key](https://e2b.dev) for sandboxed code execution
- An [Inngest](https://inngest.com) account for background jobs

## Step 1: Set Up Database

1. Create a PostgreSQL database (e.g., on Neon, Supabase, or Railway)
2. Copy the connection string for later use

## Step 2: Set Up Clerk Authentication

1. Create a new application in [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to API Keys and copy:
   - Publishable Key
   - Secret Key
3. Configure redirect URLs in Clerk:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/`
   - After sign-up URL: `/`

## Step 3: Get API Keys

### Gemini API Key
1. Visit [Google AI Studio](https://ai.google.dev/aistudio)
2. Create or select a project
3. Generate an API key

### E2B API Key
1. Sign up at [E2B](https://e2b.dev)
2. Navigate to your dashboard
3. Copy your API key

## Step 4: Deploy to Vercel

### Option A: Deploy with Vercel Integration (Recommended)

1. Click the "Deploy to Vercel" button or manually import your repository
2. Configure environment variables in Vercel:
   ```
   DATABASE_URL=<your_postgresql_connection_string>
   GEMINI_API_KEY=<your_gemini_api_key>
   E2B_API_KEY=<your_e2b_api_key>
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
   CLERK_SECRET_KEY=<your_clerk_secret_key>
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
   NEXT_PUBLIC_APP_URL=<your_vercel_app_url>
   ```
3. Deploy the application
4. **IMPORTANT**: After deployment, proceed to Step 5 to configure Inngest

### Option B: Manual Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to link your project
4. Add environment variables using `vercel env add <KEY>`
5. Deploy with `vercel --prod`

## Step 5: Configure Inngest Integration

This is the **critical step** that solves the Vercel deployment issue.

### Install Inngest Vercel Integration

1. Visit the [Inngest Vercel Integration](https://vercel.com/integrations/inngest) page
2. Click "Add Integration"
3. Select your Vercel project (the one you just deployed)
4. Authorize the integration
5. In the Inngest dashboard that opens:
   - Sign up or log in to Inngest
   - Connect your Vercel project
   - The integration will automatically:
     - Set `INNGEST_SIGNING_KEY` environment variable
     - Set `INNGEST_EVENT_KEY` environment variable
     - Sync your Inngest functions on every deployment

### Verify Integration

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Confirm that `INNGEST_SIGNING_KEY` and `INNGEST_EVENT_KEY` are present
4. Redeploy your application if these were just added

### Manual Configuration (Alternative)

If you prefer not to use the integration:

1. Create an Inngest account at [inngest.com](https://inngest.com)
2. Create a new app in the Inngest dashboard
3. Copy the Event Key and Signing Key
4. Add these to your Vercel environment variables:
   - `INNGEST_EVENT_KEY`
   - `INNGEST_SIGNING_KEY`
5. Manually sync your app URL in the Inngest dashboard

## Step 6: Run Database Migrations

After deployment:

```bash
# Connect to your production database
npx prisma migrate deploy
```

Or use Vercel's deployment hooks to run migrations automatically.

## Step 7: Verify Deployment

1. Visit your deployed application URL
2. Sign up or sign in using Clerk
3. Create a new project
4. Test the code generation feature
5. Check Inngest dashboard to verify that background jobs are running

## Troubleshooting

### Inngest Events Not Triggering

**Problem**: Background jobs don't run on Vercel, but work locally.

**Solution**:
- Ensure the Inngest Vercel integration is installed
- Verify `INNGEST_SIGNING_KEY` and `INNGEST_EVENT_KEY` are set in Vercel
- Check that your API route is at `/api/inngest` (required for auto-sync)
- Redeploy after adding environment variables
- Review Inngest dashboard for sync status and errors

### Database Connection Issues

**Problem**: Cannot connect to database.

**Solution**:
- Verify `DATABASE_URL` is correctly formatted
- Check that your database allows connections from Vercel IPs
- Ensure SSL mode is properly configured (Neon requires `sslmode=require`)

### Clerk Authentication Errors

**Problem**: Users can't sign in or authentication fails.

**Solution**:
- Verify all Clerk environment variables are set correctly
- Check that your Vercel domain is added to Clerk's allowed domains
- Ensure redirect URLs match between Clerk and your application

### E2B Sandbox Errors

**Problem**: Code generation fails with sandbox errors.

**Solution**:
- Verify `E2B_API_KEY` is set correctly
- Check your E2B account has available credits
- Ensure the sandbox template `pluffy-nextjs-test-2` exists in your E2B account

### Build Failures

**Problem**: Vercel build fails.

**Solution**:
- Ensure all dependencies are in `package.json`
- Check that `postinstall` script runs `prisma generate`
- Verify Prisma schema is valid
- Review build logs in Vercel dashboard

## Environment Variables Reference

| Variable | Required | Description | Where to Get It |
|----------|----------|-------------|-----------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | Your database provider |
| `GEMINI_API_KEY` | Yes | Google Gemini API key | Google AI Studio |
| `E2B_API_KEY` | Yes | E2B sandbox API key | E2B Dashboard |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk public key | Clerk Dashboard |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key | Clerk Dashboard |
| `INNGEST_EVENT_KEY` | Yes | Inngest event key | Auto-set by Vercel integration |
| `INNGEST_SIGNING_KEY` | Yes | Inngest signing key | Auto-set by Vercel integration |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app URL | Your Vercel deployment URL |

## Additional Resources

- [Inngest Vercel Documentation](https://www.inngest.com/docs/deploy/vercel)
- [Vercel Deployment Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Clerk Documentation](https://clerk.com/docs)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## Support

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/VINODvoid/pluffy/issues)
2. Review Vercel deployment logs
3. Check Inngest dashboard for function execution logs
4. Open a new issue with detailed error messages and logs
