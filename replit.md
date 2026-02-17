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
- `app/(app)/admin/` - Super admin pages (families, parents, students, assignments)
- `components/` - React components (assignments, attendance, calendar, goals, etc.)
- `lib/` - Utilities, auth config, DB client, actions, validations
- `prisma/` - Prisma schema and seed files
- `scripts/` - Admin creation script

## Database
- Development and production use **separate** Replit-managed PostgreSQL databases
- Development: `heliumdb` (accessed via runtime DATABASE_URL)
- Production: `neondb` (Replit-provisioned, separate instance)
- Schema managed via Prisma (`npx prisma db push`)
- Seed data via `npx prisma db seed` (defined in `prisma/seed.ts`)
- Build step: `prisma generate` + `prisma db push` + `next build`

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
- User admin: brandonplowe@gmail.com (super admin)

## Student Accounts
- Parents can optionally create login accounts for students when adding them
- Student creation form has a "Create login account" toggle with email/password fields
- Parents and super admins can reset student passwords from Settings
- Students with accounts see their own dashboard, assignments, progress, and calendar

## Super Admin
- Super admin sees a platform-wide dashboard with all families, parents, students, and assignment stats
- Dashboard cards are clickable, linking to dedicated admin list/detail pages
- Admin pages: /admin/families, /admin/parents, /admin/students, /admin/assignments
- Each list page has clickable items linking to detail views
- Sidebar includes admin-specific navigation links
- `scripts/create-admin.ts` safely creates/upgrades a super admin user without wiping data
- Usage: `ADMIN_EMAIL=you@email.com ADMIN_PASSWORD=yourpass ADMIN_NAME="Your Name" npx tsx scripts/create-admin.ts`

## Development
- Dev server runs on port 5000 (bound to 0.0.0.0)
- `allowedDevOrigins` configured in `next.config.ts` for Replit domains

## Recent Changes
- 2026-02-17: Added student login account creation (optional email/password when parent adds student)
- 2026-02-17: Added password reset for students (parents reset own family, admin resets any)
- 2026-02-17: Built clickable admin dashboard with detail pages for families, parents, students, assignments
- 2026-02-17: Added admin sidebar navigation (Families, Parents, Students, Assignments)
- 2026-02-17: Migrated dev database data to production
- 2026-02-17: Added super admin dashboard with platform-wide visibility
- 2026-02-17: Created safe admin creation script (scripts/create-admin.ts)
- 2026-02-17: Fixed assignment status filter to handle multiple values (array) from query params
- 2026-02-17: Fixed auth cookie issue, login/signup redirects, CSRF proxy issues
- 2026-02-17: Initial import and Replit environment setup
