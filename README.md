# Budget Tracker

A budget tracking app built with Next.js, Postgres (Neon), Drizzle ORM, React, TypeScript, Tailwind, and shadcn/ui.

## Features

- **Income Sources** — Set up sources of funds (salary, freelance, etc.) with different frequencies (weekly, bi-weekly, monthly, yearly)
- **Budget Planning** — Allocate your income across expenses, savings, insurance, and more
- **Transactions** — Log expenses that automatically deduct from the relevant budget category

## Setup

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Set up the database**

   - Create a [Neon](https://neon.tech) account and project
   - Copy your connection string and create a `.env` file:

   ```env
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   ```

3. **Push the schema to the database**

   ```bash
   bun run db:push
   ```

4. **Run the development server**

   ```bash
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Database Scripts

- `bun run db:push` — Push schema changes to the database
- `bun run db:generate` — Generate migrations
- `bun run db:studio` — Open Drizzle Studio to inspect data

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Postgres on Neon + Drizzle ORM
- **UI:** React, TypeScript, Tailwind CSS, shadcn/ui
