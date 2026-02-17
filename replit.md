# Homeschooling Made Simple

## Overview
A Next.js 16 homeschooling management application that helps parents organize assignments, track progress, manage attendance, and generate reports.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM (v7)
- **Auth**: NextAuth v5 (credentials-based, server actions for login/signup)
- **Styling**: Tailwind CSS v4, Radix UI, shadcn/ui
- **State**: React Query (TanStack)
- **Forms**: React Hook Form + Zod validation

## Project Structure
- `app/` - Next.js App Router pages (grouped routes: auth, app, marketing)
- `components/` - React components (assignments, attendance, calendar, goals, etc.)
- `lib/` - Utilities, auth config, DB client, actions, validations
- `prisma/` - Prisma schema and seed files

## Database
- Development and production use **separate** Replit-managed PostgreSQL databases
- Development: `heliumdb` (accessed via runtime DATABASE_URL)
- Production: `neondb` (Replit-provisioned, separate instance)
- Schema managed via Prisma (`npx prisma db push`)
- Seed data via `npx prisma db seed` (defined in `prisma/seed.ts`)
- Build step includes `prisma db push` and `prisma db seed` to sync production schema and data on deploy

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit, separate for dev/prod)
- `AUTH_SECRET` - NextAuth secret key
- `AUTH_URL` - Set in development to the Replit dev domain (HTTPS)

## Auth Notes
- Login and signup use server actions (`lib/actions/auth.ts`) to avoid CSRF issues behind the Replit proxy
- `useSecureCookies: false` is set in `lib/auth.ts` because the app runs HTTP internally behind an HTTPS proxy
- Middleware (`middleware.ts`) handles route protection and onboarding redirects
- Roles: SUPER_ADMIN, PARENT, STUDENT
- Demo credentials: parent@demo.com / password123
- Admin credentials: admin@hsms.com / admin123

## Super Admin
- Super admin sees a platform-wide dashboard with all families, parents, students, and assignment stats
- `scripts/create-admin.ts` safely creates/upgrades a super admin user without wiping data
- Usage: `ADMIN_EMAIL=you@email.com ADMIN_PASSWORD=yourpass ADMIN_NAME="Your Name" npx tsx scripts/create-admin.ts`
- Runs against whatever DATABASE_URL is set (dev or prod)

## Development
- Dev server runs on port 5000 (bound to 0.0.0.0)
- `allowedDevOrigins` configured in `next.config.ts` for Replit domains

## Recent Changes
- 2026-02-17: Added super admin dashboard with platform-wide visibility (all families, parents, students, stats)
- 2026-02-17: Created safe admin creation script (scripts/create-admin.ts) that doesn't wipe existing data
- 2026-02-17: Fixed assignment status filter to handle multiple values (array) from query params
- 2026-02-17: Documented separate dev/prod databases; added seed to deploy build step
- 2026-02-17: Removed stale external DATABASE_URL secret (was pointing to old neon.tech)
- 2026-02-17: Fixed auth cookie issue — set `useSecureCookies: false` for Replit proxy compatibility
- 2026-02-17: Fixed login/signup redirects with router.push fallback navigation
- 2026-02-17: Converted login/signup to server actions to bypass CSRF proxy issues
- 2026-02-17: Initial import and Replit environment setup
