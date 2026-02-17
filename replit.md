# Homeschooling Made Simple

## Overview
A Next.js 16 homeschooling management application that helps parents organize assignments, track progress, manage attendance, and generate reports.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM (v7)
- **Auth**: NextAuth v5 (credentials-based)
- **Styling**: Tailwind CSS v4, Radix UI, shadcn/ui
- **State**: React Query (TanStack)
- **Forms**: React Hook Form + Zod validation

## Project Structure
- `app/` - Next.js App Router pages (grouped routes: auth, app, marketing)
- `components/` - React components (assignments, attendance, calendar, goals, etc.)
- `lib/` - Utilities, auth config, DB client, actions, validations
- `prisma/` - Prisma schema and seed files

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `AUTH_SECRET` - NextAuth secret key

## Development
- Dev server runs on port 5000 (`next dev -H 0.0.0.0 -p 5000`)
- Database schema managed via Prisma (`npx prisma db push`)

## Recent Changes
- 2026-02-17: Initial import and Replit environment setup
  - Configured Next.js to run on port 5000 with allowedDevOrigins
  - Set up PostgreSQL database and Prisma schema
  - Generated AUTH_SECRET
