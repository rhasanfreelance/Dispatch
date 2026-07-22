# Dispatch

A minimal Twitter-style app: post short dispatches, like them, follow other accounts, and browse profiles. Built with Next.js 14 (App Router), Prisma, PostgreSQL, NextAuth, and Tailwind.

## Features

- Email/username + password auth (NextAuth credentials provider, bcrypt-hashed passwords)
- Post dispatches (280 char limit), delete your own
- Like / unlike
- Comment on dispatches, with a dedicated thread view, delete your own replies
- Follow / unfollow
- Search for people by name or username
- Edit your display name and bio
- Public profiles with dispatch history, follower/following counts
- "For You" (algorithmic ranking) and "Following" (chronological) feed tabs

## The feed algorithm

The "For You" tab ranks the most recent pool of dispatches by a score combining:

- **Engagement** — likes and comments, weighted (comments count more than likes) and log-scaled so a handful of viral posts don't drown out everything else
- **Time decay** — a Reddit/Hacker-News-style gravity curve, so older posts fade even if they were popular
- **Affinity** — a multiplier for accounts you follow, so you still see people you care about even if their post isn't a viral hit
- **Freshness window** — a short-lived boost for posts in their first 20 minutes, so new dispatches get initial visibility instead of being buried under old high-engagement ones

The "Following" tab stays strictly chronological, matching how Twitter/X splits its two feeds. The scoring logic lives in `src/lib/ranking.ts` if you want to tune the weights.

## Local setup

1. Install dependencies:
   ```
   npm install
   ```
   This runs `prisma generate` automatically via `postinstall`.

2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — a PostgreSQL connection string (e.g. from [Neon](https://neon.tech) or [Supabase](https://supabase.com))
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — `http://localhost:3000` for local dev

3. Push the schema to your database:
   ```
   npx prisma db push
   ```

4. Run the dev server:
   ```
   npm run dev
   ```

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Set the same three environment variables in the Vercel project settings (use your production database URL and set `NEXTAUTH_URL` to your deployed domain).
4. Deploy. The `build` script runs `prisma generate` before `next build`.

## Notes

- If you develop in a sandboxed environment without access to `binaries.prisma.sh`, run `npx prisma generate` on a machine with normal network access (or let Vercel's build do it) — the Prisma client's TypeScript types aren't available until that command succeeds.
- The schema lives in `prisma/schema.prisma`. After changing it, run `npx prisma db push` (or `prisma migrate dev` if you want migration files) and `npx prisma generate`.
