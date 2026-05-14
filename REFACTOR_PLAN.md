# Twirly — Backend Refactor Plan

> **Status:** Implemented over Sprints 1–15 (committed to `backend-add`). This document is the original blueprint and is preserved for the decision record.
> **Goal:** Replace direct Supabase client calls with a Node.js REST API backed by proven libraries. The React frontend stays structurally unchanged; only the data-fetching layer changes.
>
> **Path-rename note (Sprint 16, 2026-05-14):** This document was written before the pnpm monorepo restructure. Paths that say `server/...` are now `apps/api/...` in the working tree. Paths under `src/server/sql/` are now `apps/api/sql/` (already updated inline). When using this doc as reference, mentally substitute `server/` → `apps/api/`. The current authoritative layout is in `CLAUDE.md` and `MONOREPO_MIGRATION.md`.

---

## Table of Contents

1. [Scope & Constraints](#1-scope--constraints)
2. [Library Decisions](#2-library-decisions)
3. [Target Architecture](#3-target-architecture)
4. [Database Schema — Object-by-Object Strategy](#4-database-schema--object-by-object-strategy)
5. [Server Folder & File Architecture](#5-server-folder--file-architecture)
6. [Phase 0 — Preparation](#6-phase-0--preparation) _(includes: psql install, Docker decision, setup-db.sh)_
7. [Phase 1 — Scaffold the Server](#7-phase-1--scaffold-the-server)
8. [Phase 2 — Database Layer (Drizzle)](#8-phase-2--database-layer-drizzle)
9. [Phase 3 — Auth (Better Auth)](#9-phase-3--auth-better-auth)
10. [Phase 4 — Core API Routes (by service)](#10-phase-4--core-api-routes-by-service)
11. [Phase 5 — File Storage](#11-phase-5--file-storage)
12. [Phase 6 — Frontend Service Rewrites](#12-phase-6--frontend-service-rewrites)
13. [Phase 7 — Vite Proxy & Environment](#13-phase-7--vite-proxy--environment)
14. [Phase 8 — Cleanup & Hardening](#14-phase-8--cleanup--hardening)
15. [API Contract Reference](#15-api-contract-reference)
16. [Risk Register](#16-risk-register)

---

## 1. Scope & Constraints

### In scope
- All 13 frontend service files under `src/services/`
- The two contexts that call Supabase directly (`TrendingContext`, `AuthContext` via `useAuthHook`)
- File upload/download (currently Supabase Storage → Multer + S3)
- Environment variable plumbing for dev, staging, and production

### Out of scope (no change)
- React component tree and UI logic
- Custom hooks (`src/hooks/`) — these call services, which are transparently swapped
- Database schema — reuse the existing SQL as-is; Drizzle introspects it
- Tailwind, animation, charting, and other UI libraries
- Capacitor mobile wrappers
- Sentry integration — keep as-is on the frontend

### Hard constraints
- The app must stay functional throughout. Each service is migrated one at a time; until its routes exist, the old Supabase call stays as-is.
- No RLS enforcement needed once the server is the trusted layer — disable Supabase RLS on all tables.
- Keep the same PostgreSQL database. Only the client library changes.

---

## 2. Library Decisions

Every choice below is the most widely adopted option in its category as of 2025. The goal is to write as little custom infrastructure code as possible and lean on battle-tested libraries instead.

### Auth — Better Auth
**Package:** `better-auth`

Replaces all `supabase.auth.*` calls. Better Auth is a full-stack auth library for Node.js with built-in support for email/password, Google OAuth, session management, and password reset. It handles the complexity that would otherwise require stitching together Passport.js strategies, JWT libraries, session stores, and OAuth redirect flows manually.

| Feature | How Better Auth covers it |
|---|---|
| Email + password registration/login | `emailAndPassword: { enabled: true }` |
| Google OAuth | `socialProviders: { google: { clientId, clientSecret } }` |
| Session management | Database sessions (instant revocation, no refresh token complexity) |
| Password hashing | Built-in Argon2id (OWASP-recommended, memory-hard) |
| Password reset flow | `emailAndPassword: { resetPassword: true }` + email plugin |
| Express integration | `auth.handler` — mounted as a single Express middleware |
| Protecting routes | `auth.api.getSession()` in a `requireAuth` middleware |

Better Auth uses **database sessions** by default (not JWTs). This means no access/refresh token pair to manage on the frontend — just a session cookie. Session revocation is instant. The frontend simply calls `GET /api/auth/session` to check who is logged in.

> **Note on Lucia:** Lucia was sunset in late 2024 — the maintainer pivoted it to an architecture guide. Do not use it as a library dependency.
> **Note on Passport.js:** Still works, but requires manually wiring 3–4 strategies plus JWT logic. Better Auth does all of this with far less code.

### Database — Drizzle ORM
**Packages:** `drizzle-orm`, `drizzle-kit`, `pg` (as the underlying driver)

Replaces `@supabase/supabase-js` for all DB calls. Drizzle is a TypeScript-first ORM that writes SQL the way you think — queries look like SQL, not an abstraction over it. This makes it compatible with the existing schema's views, stored functions, and complex joins without fighting the library.

| Concern | Why Drizzle over alternatives |
|---|---|
| Existing schema compatibility | `drizzle-kit introspect` generates schema files from the live DB |
| SQL views + RPC functions | Drizzle supports raw SQL fragments and `sql` tagged template for complex queries |
| Complex joins | Fluent `.leftJoin()`, `.innerJoin()` — maps 1:1 to SQL |
| Migrations | `drizzle-kit generate` + `drizzle-kit migrate` — no custom migration scripts |
| Transactions | `db.transaction(async (tx) => { ... })` — built-in, no manual BEGIN/COMMIT |
| vs Prisma | Prisma abstracts further from SQL; fighting it with views/stored functions is painful |
| vs raw pg | Raw pg has no type safety; Drizzle adds type safety with zero magic |

### Password Hashing — Argon2id (via Better Auth)
Better Auth uses Argon2id internally. OWASP's 2024/2025 Password Storage Cheat Sheet recommends Argon2id as the first choice. No separate bcrypt setup is needed.

### Request Validation — Zod
**Package:** `zod` (already in the frontend `package.json`)

Every request body and query param is validated with a Zod schema before reaching the controller. Zod is already used in the frontend — using it on the server keeps the stack consistent and allows sharing schema types in the future.

### HTTP Logging — Pino + pino-http
**Packages:** `pino`, `pino-http`

Replaces morgan. Pino is 5–10× faster than Winston, outputs structured JSON, and has native OpenTelemetry support. `pino-http` is middleware that injects a `req.log` logger with a request ID on every request, making all subsequent log lines traceable back to the originating HTTP call.

### Rate Limiting — express-rate-limit
**Package:** `express-rate-limit`

10M+ weekly downloads. The standard. Applied to auth endpoints. Back with Redis in production for multi-instance deployments.

### HTTP Error Objects — http-errors
**Package:** `http-errors`

`createError(404, 'Comparison not found')` produces an Error with `.status`, `.message`, and `.expose` properties. The global error handler reads these properties to format the JSON response. Eliminates repetitive `res.status(404).json(...)` patterns from controllers.

### Email — Resend
**Package:** `resend`

The simplest API: `resend.emails.send({ from, to, subject, html })`. Permanent free tier (3,000 emails/month). Used for password reset emails. React Email templates can be added later for branded HTML emails.

### File Uploads — Multer + multer-s3
**Packages:** `multer`, `multer-s3`, `@aws-sdk/client-s3`

Multer handles multipart form parsing. `multer-s3` streams directly to S3 without buffering to disk — important for production. In development, a local disk driver is used instead (no S3 needed).

### Environment Validation — dotenv + Zod
**Packages:** `dotenv`, `zod`

`server/config/env.js` loads `.env` with dotenv, then parses and validates with a Zod schema. If any required variable is missing or malformed, the process throws at startup with a clear message — not a confusing undefined reference at runtime.

---

## 3. Target Architecture

```
Browser (React + Vite)
    │
    │  fetch/axios to /api/*
    ▼
Vite dev proxy (:3000 → :4000)          [dev only]
    │
    ▼
Node.js + Express API (:4000)
    │
    ├── /api/auth/*         Better Auth — sessions, Google OAuth, password reset
    ├── /api/comparisons/*  comparison_sets + items + aspects
    ├── /api/products/*     items + categories
    ├── /api/votes/*        votes
    ├── /api/reviews/*      reviews + review_likes + metrics
    ├── /api/comments/*     comments + replies + reactions
    ├── /api/users/*        user_preferences + notification settings
    ├── /api/activity/*     user_activity_log
    ├── /api/karma/*        karma_points
    ├── /api/search/*       views: searchable_items, popular_comparison_sets
    ├── /api/polls/*        comparison_sets (poll view)
    ├── /api/trending/*     RPC: fetch_popular_aspect_sets_for_user, get_filtered_sets
    ├── /api/feedback/*     feedback + image uploads
    └── /api/uploads/*      multipart → S3 or local disk
         │
         ▼
    PostgreSQL (Supabase-hosted, direct connection via DATABASE_URL)
    ← Drizzle ORM, same schema, no RLS
```

In production: Vite static output is served by a CDN or `express.static`. The `/api` prefix always routes to Express.

---

## 4. Database Schema — Object-by-Object Strategy

> **Short answer:** Yes — Express, Drizzle, and Better Auth are all PostgreSQL-native. The existing schema stays intact. The table below shows exactly how each category of DB object is handled in the new setup.

The existing database has **22 tables, 21 views, 10 stored functions, 3 triggers, and 40+ indices**, all on PostgreSQL. None of this needs to be rewritten. The work is about choosing the right tool for each object type and handling the auth FK migration cleanly.

### 4.1 — Object inventory and handling

| Object type | Count | Managed by | Strategy |
|---|---|---|---|
| **Tables** | 22 | Drizzle ORM | Introspected → `.js` schema files → future changes via `drizzle-kit generate` migrations |
| **Views** | 21 | Raw SQL files | Queried by Drizzle via `sql` tag or typed as `.existing()` pgView stubs; SQL files untouched |
| **Stored functions** | 10 | Raw SQL files | Called via `db.execute(sql\`...\`)`; 2 auth functions dropped and replaced by app code |
| **Triggers** | 3 | Raw SQL | 2 auth triggers dropped; 1 timestamp trigger kept if storage table is kept |
| **Indices** | 40+ | Drizzle | Captured by introspect; future indices added in schema files |
| **RLS policies** | All tables | Disabled | Server is trusted layer — RLS adds complexity with zero benefit once backend controls access |
| **Better Auth tables** | 4 new | Drizzle + Better Auth | Created by `better-auth migrate` or Drizzle migration; `user`, `session`, `account`, `verification` |
| **FK constraints to `auth.users`** | All user_id cols | One-time migration | Drop old constraints → re-add pointing to Better Auth `user` table |
| **Supabase Storage buckets** | 3 | Removed | Replaced by Multer + S3 (or local disk); existing URLs remain accessible during transition |

---

### 4.2 — Tables (22 existing)

**Full list of existing tables:**

| Table | Description |
|---|---|
| `categories` | Product/comparison categories |
| `items` | Products/entities being compared |
| `item_categories` | items ↔ categories (M2M) |
| `set_categories` | comparison_sets ↔ categories (M2M) |
| `comparison_sets` | Poll groups |
| `comparison_set_items` | Items within a comparison set |
| `comparison_set_aspects` | Scoring metrics for a comparison set |
| `votes` | User votes within a set |
| `comparison_set_comments` | Top-level comments on sets |
| `comparison_set_comment_replies` | Replies to comments (2 levels max) |
| `comparison_set_comment_reactions` | Like/dislike reactions on comments or replies |
| `user_preferences` | User profile + settings |
| `user_notification_settings` | Per-user notification toggles |
| `user_category_preferences` | User's favourite categories |
| `profiles` | **Redundant with Better Auth `user` + `user_preferences` — DROP this table** |
| `reviews` | User-written item reviews |
| `review_likes` | Which users liked which reviews |
| `user_activity_log` | Karma and activity events |
| `user_activity_batch` | UNIMPLEMENTED — batch staging table |
| `user_views` | Which sets a user has viewed |
| `storage` | Custom file metadata (Supabase Storage mirror) — can be dropped |
| `feedback` | User bug reports and suggestions |

**How tables are managed going forward:**

1. Run `drizzle-kit introspect` once against the live DB — generates JS schema files in `server/src/db/schema/`.
2. All future table changes (new column, new table) go through `drizzle-kit generate` → migration file → `drizzle-kit migrate`.
3. Never edit migration files by hand after they're generated.

```
# One-time: generate schema files from the existing DB
npx drizzle-kit introspect

# Going forward: after editing a schema file
npx drizzle-kit generate   # creates a new migration file
npx drizzle-kit migrate    # applies it to the DB
```

---

### 4.3 — Views (21 existing)

Views are **not managed by Drizzle migrations** — they contain complex SQL (time-decay scoring, statistical aggregates) that must not be accidentally dropped or regenerated. They stay as the existing SQL files already in `apps/api/sql/ddl/views/`.

**Full list of existing views:**

| View | Used by |
|---|---|
| `item_metric_averages` | reviews feature |
| `similar_comparison_sets` | explore/similar sets |
| `comparison_set_vote_counts` | vote counts |
| `comparison_set_comment_counts` | comment counts |
| `popular_comparison_sets` | search, trending |
| `searchable_items` | search |
| `user_weekly_activity` | user dashboard |
| `user_recent_activities` | user dashboard |
| `user_activity_trends` | user dashboard |
| `product_weekly_activity` | item detail |
| `product_recent_activities` | item detail |
| `product_activity_trends` | item detail |
| `categorized_sets` | category pages |
| `controversial_sets` | trending (controversial filter) |
| `viral_sets` | trending (viral filter) |
| `top_categories` | category list |
| `top_category_groups` | category grouping |
| `comparison_sets_with_users` | comparison list |
| `user_activity_summary` | user dashboard |
| `karma_points` | karma feature |
| `comparison_set_metrics` | internal |

**How to query views from Drizzle:**

Option A — raw SQL (always works, no type safety):
```js
// server/src/features/search/search.queries.js
export async function searchSets(q, limit) {
  const result = await db.execute(
    sql`SELECT * FROM popular_comparison_sets WHERE name ILIKE ${'%' + q + '%'} LIMIT ${limit}`
  );
  return result.rows;
}
```

Option B — typed pgView stub (type-safe, Drizzle knows the shape but never touches the SQL):
```js
// server/src/db/schema/views.js
import { pgView, integer, varchar, numeric } from 'drizzle-orm/pg-core';

export const popularComparisonSets = pgView('popular_comparison_sets', {
  setId:           integer('set_id'),
  name:            varchar('name', { length: 255 }),
  userId:          uuid('user_id'),
  createdAt:       timestamp('created_at'),
  totalVotes:      integer('total_votes'),
  popularityScore: numeric('popularity_score'),
}).existing();  // ← tells Drizzle: this already exists, don't CREATE or DROP it
```

Then query it like a regular table:
```js
import { popularComparisonSets } from '../../db/schema/views.js';

export async function searchSets(q, limit) {
  return db.select().from(popularComparisonSets)
    .where(ilike(popularComparisonSets.name, `%${q}%`))
    .limit(limit);
}
```

**Recommendation:** Use Option B for views that are queried heavily (search, trending, karma). Use Option A for one-off or admin queries.

The SQL view files already in `apps/api/sql/ddl/views/` are the source of truth. When deploying to a new environment, run those files once against the DB before starting the server.

---

### 4.4 — Stored Functions (10 existing)

Called from query files via Drizzle's `sql` template tag. The SQL files stay as-is in `apps/api/sql/ddl/functions/`.

**Function inventory and action required:**

| Function | Action | Reason |
|---|---|---|
| `handle_new_user()` | **DROP** | Fires on `auth.users` INSERT — replaced by Better Auth `hooks.after` in `config/auth.js` |
| `handle_new_user_preferences()` | **DROP** | Same — logic moves to Better Auth `hooks.after` |
| `update_updated_at_column()` | Keep | Generic timestamp utility, used by storage trigger |
| `fetch_popular_aspect_sets_for_user(v_user_id)` | Keep | Called by trending queries |
| `get_filtered_sets(_user_id, _filter_type, …)` | Keep | Called by home feed / trending |
| `mark_set_viewed(_user_id, _set_id)` | Keep | Called by activity tracking |
| `fetch_filtered_comments(search)` | Keep | Called by comment search |
| `fetch_similar_sets(p_source_set_id, …)` | Keep | Called by explore feature |
| `increment_activity_batch(…)` | Keep (future) | Marked UNIMPLEMENTED in SQL file |
| `flush_activity_batch(…)` | Keep (future) | Marked UNIMPLEMENTED in SQL file |

**Calling pattern in query files:**
```js
// server/src/features/trending/trending.queries.js
import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

export async function getPopularAspectSets(userId) {
  const result = await db.execute(
    sql`SELECT * FROM fetch_popular_aspect_sets_for_user(${userId})`
  );
  return result.rows;
}

export async function getFilteredSets({ userId, filterType, categoryId, categoryIds, limit }) {
  const result = await db.execute(
    sql`SELECT * FROM get_filtered_sets(${userId}, ${filterType}, ${categoryId}, ${categoryIds}, ${limit})`
  );
  return result.rows;
}

export async function markSetViewed(userId, setId) {
  await db.execute(sql`SELECT mark_set_viewed(${userId}, ${setId})`);
}
```

---

### 4.5 — Triggers (3 existing)

| Trigger | On table | Action |
|---|---|---|
| `on_auth_user_created` | `auth.users` | **DROP** — fires on Supabase Auth user creation; replaced by Better Auth hook |
| `on_auth_user_created_preferences` | `auth.users` | **DROP** — same reason |
| `update_storage_updated_at` | `storage` | **DROP** if `storage` table is removed; otherwise keep |

**What replaces the dropped triggers:**

The logic from both auth triggers (`handle_new_user` creates a `profiles` row; `handle_new_user_preferences` creates `user_preferences` and `user_notification_settings` rows) moves into a Better Auth `after` hook:

```js
// server/src/config/auth.js — inside betterAuth({ ... })
hooks: {
  after: [
    {
      matcher: (ctx) => ctx.path === '/sign-up/email',
      handler: async (ctx) => {
        const userId = ctx.context.newSession?.user.id;
        const username = ctx.context.body?.username;
        if (!userId) return;

        // replaces handle_new_user_preferences() trigger
        await db.insert(userPreferences).values({
          userId,
          username: username ?? null,
          isOnboardingComplete: false,
        });
        await db.insert(userNotificationSettings).values({
          userId,
          emailNotifications: true,
          voteNotifications: true,
          commentNotifications: true,
        });
        // profiles table is dropped — Better Auth's user table replaces it
      },
    },
  ],
},
```

Google OAuth users get a `user_preferences` row via the same hook pattern on `/sign-in/social` callback.

---

### 4.6 — RLS Policies (disable all)

Supabase RLS was the access control layer when the anonymous frontend client talked directly to the DB. Now that the Express server is the only DB client, RLS is redundant — and will actively block queries from the direct `pg` connection unless disabled.

Run this before starting the server (add to a setup migration):
```sql
ALTER TABLE categories                       DISABLE ROW LEVEL SECURITY;
ALTER TABLE items                            DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_categories                  DISABLE ROW LEVEL SECURITY;
ALTER TABLE set_categories                   DISABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_sets                  DISABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_set_items             DISABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_set_aspects           DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes                            DISABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_set_comments          DISABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_set_comment_replies   DISABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_set_comment_reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_settings       DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_category_preferences        DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                          DISABLE ROW LEVEL SECURITY;
ALTER TABLE review_likes                     DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log                DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_views                       DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback                         DISABLE ROW LEVEL SECURITY;
```

Authorization is now enforced in `requireAuth` and `requireOwner` middleware — not in the DB.

---

### 4.7 — Better Auth: 4 New Tables

Better Auth creates and owns these tables. Run `npx @better-auth/cli generate --output ./server/src/db/migrations/` to produce the SQL, then apply it before starting the server.

| Table | Purpose |
|---|---|
| `user` | Replaces Supabase `auth.users` as the identity source. Columns: `id`, `email`, `name`, `emailVerified`, `image`, `createdAt`, `updatedAt` |
| `session` | Active login sessions. Columns: `id`, `userId`, `token`, `expiresAt`, `ipAddress`, `userAgent`, `createdAt`, `updatedAt` |
| `account` | OAuth provider links (Google). Columns: `id`, `userId`, `providerId`, `accountId`, `accessToken`, `refreshToken`, `expiresAt`, etc. |
| `verification` | Email verification and password reset tokens. Columns: `id`, `identifier`, `value`, `expiresAt`, `createdAt`, `updatedAt` |

**Naming conflict check:** Better Auth's `user` table is a reserved PostgreSQL keyword. Better Auth quotes it (`"user"`) automatically. No manual quoting needed in application code.

---

### 4.8 — FK Migration: `auth.users` → Better Auth `user`

This is the most critical one-time database change. Every `user_id UUID REFERENCES auth.users(id)` column across all tables must be redirected to `"user"(id)`.

**Tables with `user_id` FKs to update:**

`items`, `comparison_sets`, `votes`, `comparison_set_comments`, `comparison_set_comment_replies`, `comparison_set_comment_reactions`, `user_preferences`, `user_notification_settings`, `user_category_preferences`, `reviews`, `review_likes`, `user_activity_log`, `user_views`

**Migration steps (run in a single transaction):**

**Step 1 — Export existing users from Supabase**
In the Supabase dashboard: Authentication → Users → Export as CSV. This gives you `id` (UUID) and `email` for every existing user.

**Step 2 — Configure Better Auth to use UUID IDs**
```js
// server/src/config/auth.js
betterAuth({
  advanced: {
    generateId: () => crypto.randomUUID(),  // match the UUID format of existing IDs
  },
  // ...
})
```

**Step 3 — Insert existing users into Better Auth's `user` table using their original UUIDs**
```sql
-- Run once after creating the user table
INSERT INTO "user" (id, email, name, "emailVerified", "createdAt", "updatedAt")
VALUES
  ('original-uuid-1', 'user1@example.com', 'User One', true, NOW(), NOW()),
  ('original-uuid-2', 'user2@example.com', 'User Two', true, NOW(), NOW());
  -- ... one row per exported user
```

By preserving the original Supabase UUIDs, all existing FK values in every other table remain valid — no cascade updates needed.

**Step 4 — Update FK constraints to point to the new table**
```sql
BEGIN;

-- items
ALTER TABLE items DROP CONSTRAINT items_user_id_fkey;
ALTER TABLE items ADD CONSTRAINT items_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- comparison_sets
ALTER TABLE comparison_sets DROP CONSTRAINT comparison_sets_user_id_fkey;
ALTER TABLE comparison_sets ADD CONSTRAINT comparison_sets_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- votes
ALTER TABLE votes DROP CONSTRAINT votes_user_id_fkey;
ALTER TABLE votes ADD CONSTRAINT votes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- user_preferences
ALTER TABLE user_preferences DROP CONSTRAINT user_preferences_user_id_fkey;
ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- user_notification_settings
ALTER TABLE user_notification_settings DROP CONSTRAINT user_notification_settings_user_id_fkey;
ALTER TABLE user_notification_settings ADD CONSTRAINT user_notification_settings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- user_category_preferences
ALTER TABLE user_category_preferences DROP CONSTRAINT user_category_preferences_user_id_fkey;
ALTER TABLE user_category_preferences ADD CONSTRAINT user_category_preferences_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- reviews
ALTER TABLE reviews DROP CONSTRAINT reviews_user_id_fkey;
ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- review_likes
ALTER TABLE review_likes DROP CONSTRAINT review_likes_user_id_fkey;
ALTER TABLE review_likes ADD CONSTRAINT review_likes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- comparison_set_comments
ALTER TABLE comparison_set_comments DROP CONSTRAINT comparison_set_comments_user_id_fkey;
ALTER TABLE comparison_set_comments ADD CONSTRAINT comparison_set_comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- comparison_set_comment_replies
ALTER TABLE comparison_set_comment_replies DROP CONSTRAINT comparison_set_comment_replies_user_id_fkey;
ALTER TABLE comparison_set_comment_replies ADD CONSTRAINT comparison_set_comment_replies_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- comparison_set_comment_reactions
ALTER TABLE comparison_set_comment_reactions DROP CONSTRAINT comparison_set_comment_reactions_user_id_fkey;
ALTER TABLE comparison_set_comment_reactions ADD CONSTRAINT comparison_set_comment_reactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- user_activity_log
ALTER TABLE user_activity_log DROP CONSTRAINT user_activity_log_user_id_fkey;
ALTER TABLE user_activity_log ADD CONSTRAINT user_activity_log_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- user_views
ALTER TABLE user_views DROP CONSTRAINT user_views_user_id_fkey;
ALTER TABLE user_views ADD CONSTRAINT user_views_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

COMMIT;
```

**Step 5 — Drop now-redundant objects**
```sql
-- profiles table is made redundant by Better Auth user table + user_preferences
DROP TABLE IF EXISTS profiles;

-- Drop auth triggers (they fired on auth.users INSERT which no longer happens)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_new_user_preferences();
```

**Step 6 — Verify**
After applying, confirm:
- `SELECT * FROM "user" LIMIT 5;` — should show migrated users
- `SELECT * FROM user_preferences LIMIT 5;` — should show existing preferences intact
- `SELECT count(*) FROM votes;` — FK constraint test (would fail if any FK is broken)

---

### 4.9 — How to deploy SQL objects to a new environment

When setting up a fresh database (staging, new dev machine), apply objects in this order:

```
1. server/src/db/migrations/       ← Drizzle migration files (tables + Better Auth tables)
2. apps/api/sql/ddl/views/       ← Views (20 SQL files) — run each manually or via a script
3. apps/api/sql/ddl/functions/   ← Functions — run each manually (skip dropped auth functions)
4. Section 4.6 SQL above           ← Disable RLS on all tables
5. Section 4.8 Step 3 + 4 SQL     ← Insert users + update FK constraints
```

A `server/scripts/setup-db.sh` script should automate steps 2–4 by piping the SQL files to `psql $DATABASE_URL`.

---

## 5. Server Folder & File Architecture

The server uses a **feature-based** layout: each domain is a self-contained folder. All code for a feature lives together. When you open `server/src/features/comparisons/`, you see everything about comparisons — no hunting across multiple top-level directories.

### Why feature-based?
- **Readable:** You immediately know where to look for any behaviour
- **Extensible:** Adding a new feature = adding a new folder, nothing else changes
- **Deletable:** Removing a feature = deleting a folder and one `app.js` mount line
- **Testable:** Each layer (queries, controller, routes) is independently testable

### Directory tree

```
server/
│
├── src/
│   │
│   ├── features/                       ← one folder per domain
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.routes.js          ← mounts Better Auth handler + any custom endpoints
│   │   │   └── auth.schema.js          ← Zod schemas (if any custom endpoints added)
│   │   │
│   │   ├── comparisons/
│   │   │   ├── comparisons.routes.js   ← Express Router, declares paths + applies middleware
│   │   │   ├── comparisons.controller.js  ← reads req, calls queries, writes res
│   │   │   ├── comparisons.queries.js  ← all Drizzle calls; NO req/res here
│   │   │   └── comparisons.schema.js   ← Zod schemas for request bodies + query params
│   │   │
│   │   ├── products/
│   │   │   ├── products.routes.js
│   │   │   ├── products.controller.js
│   │   │   ├── products.queries.js
│   │   │   └── products.schema.js
│   │   │
│   │   ├── votes/
│   │   │   ├── votes.routes.js
│   │   │   ├── votes.controller.js
│   │   │   ├── votes.queries.js
│   │   │   └── votes.schema.js
│   │   │
│   │   ├── reviews/
│   │   │   ├── reviews.routes.js
│   │   │   ├── reviews.controller.js
│   │   │   ├── reviews.queries.js
│   │   │   └── reviews.schema.js
│   │   │
│   │   ├── comments/
│   │   │   ├── comments.routes.js
│   │   │   ├── comments.controller.js
│   │   │   ├── comments.queries.js
│   │   │   └── comments.schema.js
│   │   │
│   │   ├── users/
│   │   │   ├── users.routes.js
│   │   │   ├── users.controller.js
│   │   │   ├── users.queries.js
│   │   │   └── users.schema.js
│   │   │
│   │   ├── activity/
│   │   │   ├── activity.routes.js
│   │   │   ├── activity.controller.js
│   │   │   ├── activity.queries.js
│   │   │   └── activity.schema.js
│   │   │
│   │   ├── karma/
│   │   │   ├── karma.routes.js
│   │   │   ├── karma.controller.js
│   │   │   └── karma.queries.js
│   │   │
│   │   ├── search/
│   │   │   ├── search.routes.js
│   │   │   ├── search.controller.js
│   │   │   └── search.queries.js
│   │   │
│   │   ├── polls/
│   │   │   ├── polls.routes.js
│   │   │   ├── polls.controller.js
│   │   │   └── polls.queries.js
│   │   │
│   │   ├── trending/
│   │   │   ├── trending.routes.js
│   │   │   ├── trending.controller.js
│   │   │   └── trending.queries.js
│   │   │
│   │   ├── feedback/
│   │   │   ├── feedback.routes.js
│   │   │   ├── feedback.controller.js
│   │   │   ├── feedback.queries.js
│   │   │   └── feedback.schema.js
│   │   │
│   │   └── uploads/
│   │       ├── uploads.routes.js
│   │       └── uploads.controller.js
│   │
│   ├── middleware/                      ← shared middleware, used across features
│   │   ├── requireAuth.js              ← calls auth.api.getSession(); attaches req.user
│   │   ├── requireOwner.js             ← checks req.user.id === resource.user_id
│   │   ├── validate.js                 ← Zod wrapper: validate(schema) → middleware fn
│   │   ├── rateLimiter.js              ← express-rate-limit presets (auth, api, uploads)
│   │   └── errorHandler.js             ← global Express error handler (last middleware)
│   │
│   ├── config/                         ← singletons, instantiated once at startup
│   │   ├── env.js                      ← dotenv + Zod, throws if any var is missing
│   │   ├── db.js                       ← Drizzle client singleton (pg pool underneath)
│   │   ├── auth.js                     ← Better Auth instance (imported by auth.routes + requireAuth)
│   │   └── storage.js                  ← Multer configuration, local vs S3 driver
│   │
│   ├── db/
│   │   ├── schema/                     ← Drizzle table definitions (generated by introspect)
│   │   │   ├── users.js                ← app_users table
│   │   │   ├── items.js                ← items + item_categories
│   │   │   ├── comparisons.js          ← comparison_sets + items + aspects
│   │   │   ├── votes.js
│   │   │   ├── reviews.js
│   │   │   ├── comments.js
│   │   │   ├── user-preferences.js
│   │   │   ├── feedback.js
│   │   │   └── index.js               ← re-exports all schemas for convenience
│   │   └── migrations/                ← generated by drizzle-kit, never hand-edited
│   │
│   ├── lib/                            ← stateless utility modules
│   │   ├── logger.js                   ← Pino instance, imported everywhere
│   │   ├── mailer.js                   ← Resend client, used by auth feature
│   │   └── errors.js                   ← http-errors convenience wrappers (notFound, forbidden, …)
│   │
│   ├── app.js                          ← Express app factory, mounts all routers
│   └── index.js                        ← entry point: imports app, calls app.listen()
│
├── drizzle.config.js                   ← points drizzle-kit at DATABASE_URL + schema dir
├── package.json
├── .env.example
└── nodemon.json
```

### Layer responsibilities (strictly separated)

| Layer | File | Knows about | Does NOT know about |
|---|---|---|---|
| **Routes** | `*.routes.js` | HTTP verbs, paths, which middleware to apply, which controller fn to call | SQL, business logic |
| **Controller** | `*.controller.js` | `req`, `res`, `next`; calls query functions; shapes the response | SQL syntax, Drizzle API |
| **Queries** | `*.queries.js` | Drizzle ORM, table schema, SQL | HTTP, `req`/`res` |
| **Schema** | `*.schema.js` | Zod shape of request bodies and query params | Routes, DB, HTTP |
| **Middleware** | `middleware/*.js` | Cross-cutting concerns: auth, validation, rate limits, errors | Business logic |
| **Config** | `config/*.js` | Env vars, singleton clients | Application logic |
| **Lib** | `lib/*.js` | Stateless utilities (logger, mailer, error factories) | Application logic |

### Inside a feature — worked example: `comparisons`

```
comparisons.schema.js       — Zod schemas

  CreateComparisonSchema = z.object({
    name: z.string().min(3),
    description: z.string().optional(),
    items: z.array(z.object({ item_id: z.number() })).min(2),
    aspects: z.array(z.object({ metric_name: z.string(), weight: z.number() }))
  })


comparisons.queries.js      — Drizzle data access

  getComparisonById(id)           → SELECT with JOINs on items + aspects
  createComparison(data, userId)  → db.transaction: INSERT set → items → aspects
  getUserComparisons(userId)      → SELECT WHERE user_id = userId ORDER BY created_at
  deleteComparison(id)            → DELETE WHERE id = id
  ...


comparisons.controller.js   — req → queries → res

  getById = async (req, res, next) => {
    const comparison = await getComparisonById(req.params.id);
    if (!comparison) return next(createError(404, 'Comparison not found'));
    res.json({ data: comparison });
  }

  create = async (req, res, next) => {
    const comparison = await createComparison(req.body, req.user.id);
    res.status(201).json({ data: comparison });
  }


comparisons.routes.js        — HTTP wiring

  router.get('/:id', getById)
  router.get('/', requireAuth, getUserComparisons)
  router.post('/', requireAuth, validate(CreateComparisonSchema), create)
  router.put('/:id', requireAuth, validate(UpdateComparisonSchema), update)
  router.delete('/:id', requireAuth, destroy)
```

---

## 6. Phase 0 — Preparation

> Goal: zero code changes to the running app; set up tooling so both processes run together.

---

### 0.0 — Prerequisites & local database strategy

#### Do you need Docker?

**No — not for the database itself.** The PostgreSQL database already lives on Supabase and is accessible remotely. The Node.js server connects to it over the internet via `DATABASE_URL`. You do not need to run a local Postgres server to develop or run this app.

**However, you do need the `psql` CLI client** — a lightweight command-line tool for running SQL files against the remote DB. It does not install a database server; it's just a terminal client.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Your machine                                                        │
│                                                                      │
│  ┌──────────┐    DATABASE_URL    ┌──────────────────────────────┐   │
│  │ Node.js  │ ─────────────────► │  Supabase PostgreSQL (cloud) │   │
│  │ server   │                    │  Already running, no setup   │   │
│  └──────────┘                    └──────────────────────────────┘   │
│                                                                      │
│  psql (CLI client only, no server) ─────────────────────────────►  │
│  Used to run SQL setup scripts                                       │
└─────────────────────────────────────────────────────────────────────┘
```

#### Install `psql` (CLI client only)

You only need the client tools — not the full PostgreSQL server installation.

**macOS (Homebrew — recommended):**
```bash
brew install libpq
# libpq gives you psql, pg_dump, etc. without installing a Postgres server.

# Add it to your PATH (libpq is keg-only, not linked by default):
echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify:
psql --version
# psql (PostgreSQL) 16.x
```

**macOS (alternative — full Postgres.app):**
```bash
# Download Postgres.app from https://postgresapp.com
# Includes psql + a local DB server (server not needed, but app is easy)
# Add to PATH from the app's settings panel
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install -y postgresql-client
# Installs psql client only, no server daemon
psql --version
```

**Windows:**
```
Download the PostgreSQL installer from https://www.postgresql.org/download/windows/
During install, uncheck "PostgreSQL Server" and "pgAdmin" — keep only "Command Line Tools"
Add C:\Program Files\PostgreSQL\16\bin to your PATH
```

**Or: skip psql entirely and use the Supabase SQL Editor**
Every SQL file in `apps/api/sql/` can be copy-pasted into the **Supabase Dashboard → SQL Editor** and run directly in the browser. This works fine for one-off migrations and setup scripts. Use `psql` only when you want to automate it in a shell script.

---

#### Should we use Docker for local development?

**Short answer: optional, but useful later.**

| Approach | When to use |
|---|---|
| **Connect directly to Supabase** (default, no Docker) | During this refactor — DB is already there, no setup required, everyone uses the same dev DB |
| **Docker Compose with local Postgres** | Once the app is stable — for isolated dev environments, running tests against a throwaway DB, or CI pipelines |

**Recommendation for now:** connect directly to Supabase. Add Docker Compose later as a `docker-compose.yml` at the repo root.

If/when you add Docker, the Compose file would look like:
```yaml
# docker-compose.yml (add later, not needed now)
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: twirly
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - ./server/scripts/setup-db.sh:/docker-entrypoint-initdb.d/setup.sh
      # Postgres runs all .sh and .sql files in initdb.d on first start
```

Then `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/twirly` for local Docker.

---

#### How `psql` is used in this project

`psql` is needed in two situations:

**1. Running setup scripts against the DB (one-time)**

After pulling the repo for the first time, or setting up a fresh environment:
```bash
# Set your database URL
export DATABASE_URL="postgresql://postgres:<pass>@db.<project>.supabase.co:5432/postgres"

# Run the setup script (to be created in Phase 0)
bash server/scripts/setup-db.sh
```

The script runs all view and function SQL files in the correct order.

**2. Running one-off migrations**

```bash
# Run a specific SQL file
psql $DATABASE_URL -f server/scripts/disable-rls.sql

# Run an inline SQL statement
psql $DATABASE_URL -c "ALTER TABLE items DISABLE ROW LEVEL SECURITY;"

# Open an interactive session
psql $DATABASE_URL
# Then type SQL interactively, \q to quit
```

**Using Supabase SQL Editor instead of psql:**
1. Open Supabase Dashboard → your project → SQL Editor
2. Paste the SQL content
3. Click "Run"

Both methods produce identical results. Use whichever is more comfortable.

---

#### `server/scripts/setup-db.sh` (to be created in Phase 2)

This script applies all static SQL objects to the database. It's idempotent — safe to run multiple times.

```bash
#!/usr/bin/env bash
# server/scripts/setup-db.sh
# Usage: DATABASE_URL=postgresql://... bash server/scripts/setup-db.sh

set -e  # exit on first error

SQL_ROOT="$(dirname "$0")/../../apps/api/sql/ddl"

echo "→ Disabling RLS..."
psql "$DATABASE_URL" -f "$(dirname "$0")/disable-rls.sql"

echo "→ Creating views..."
psql "$DATABASE_URL" -f "$SQL_ROOT/views/recommendation_views.sql"
psql "$DATABASE_URL" -f "$SQL_ROOT/views/activity-views.sql"
psql "$DATABASE_URL" -f "$SQL_ROOT/views/viral_sets.sql"
psql "$DATABASE_URL" -f "$SQL_ROOT/views/controversial_sets.sql"
psql "$DATABASE_URL" -f "$SQL_ROOT/views/top_categories.sql"
psql "$DATABASE_URL" -f "$SQL_ROOT/views/categorized_sets.sql"
psql "$DATABASE_URL" -f "$SQL_ROOT/views/user-comparison-view.sql"
psql "$DATABASE_URL" -f "$SQL_ROOT/views/user-dashboard-views.sql"
psql "$DATABASE_URL" -f "$SQL_ROOT/views/explore_similar_view.sql"

echo "→ Creating functions..."
psql "$DATABASE_URL" -f "$SQL_ROOT/functions/get_filtered_sets.sql"
psql "$DATABASE_URL" -f "$SQL_ROOT/functions/mark_set_viewed.sql"
psql "$DATABASE_URL" -f "$SQL_ROOT/functions/fun_fetch_filtered_comments.sql"
# Note: handle_new_user and handle_new_user_preferences are NOT included
# — they are replaced by Better Auth hooks in Phase 3

echo "✓ Database setup complete"
```

Run it once per environment. After that, Drizzle migrations handle table changes and the views/functions only change when you edit the SQL files manually.

---

### 0.1 — Root-level dev tooling
Add to root `package.json` (devDependencies):
- `concurrently` — run Vite and Express together in one terminal

Update scripts:
```json
{
  "scripts": {
    "dev": "concurrently -n client,server -c blue,green \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "vite",
    "dev:server": "cd server && node --watch src/index.js"
  }
}
```

### 0.2 — Create `server/package.json`

**Production dependencies:**

| Package | Version | Purpose |
|---|---|---|
| `express` | ^5 | HTTP server |
| `better-auth` | latest | Full auth system (sessions, Google OAuth, password reset) |
| `drizzle-orm` | latest | ORM / query builder |
| `pg` | ^8 | PostgreSQL driver (used by Drizzle) |
| `zod` | ^3 | Request validation + env parsing |
| `multer` | ^1 | Multipart file upload parsing |
| `multer-s3` | ^3 | Stream uploads directly to S3 |
| `@aws-sdk/client-s3` | latest | AWS S3 client (v3) |
| `pino` | ^9 | Structured JSON logging |
| `pino-http` | ^10 | HTTP request logging middleware |
| `http-errors` | ^2 | Structured HTTP error objects |
| `resend` | ^4 | Transactional email (password reset) |
| `cors` | ^2 | CORS headers |
| `helmet` | ^8 | Security headers |
| `express-rate-limit` | ^7 | Rate limiting |
| `dotenv` | ^16 | Load .env file |
| `cookie-parser` | ^1 | Parse cookies (Better Auth sessions) |

**Dev dependencies:**

| Package | Purpose |
|---|---|
| `drizzle-kit` | Schema introspection + migration generation |
| `nodemon` | Auto-restart on file change (or use `node --watch`) |

### 0.3 — Environment variables

**`server/.env.example`:**
```bash
# Database
DATABASE_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres

# Better Auth
BETTER_AUTH_SECRET=<32+ random bytes>
BETTER_AUTH_URL=http://localhost:4000

# Google OAuth (optional — needed for Google login)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=noreply@yourapp.com

# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Storage
STORAGE_DRIVER=local              # "local" or "s3"
UPLOAD_DIR=./uploads              # used when STORAGE_DRIVER=local
AWS_BUCKET=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

**Frontend `.env` additions:**
```bash
VITE_API_URL=http://localhost:3000   # goes through Vite proxy → server
```

**Remove from frontend `.env` when migration completes:**
```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 0.4 — Get the Supabase direct connection string
In the Supabase dashboard: **Settings → Database → Connection Pooling → Transaction mode → URI**.
This becomes `DATABASE_URL`. The existing anon key is no longer needed once migration completes.

### 0.5 — Disable Supabase RLS
Once the server is the trusted layer, RLS is redundant. The server enforces ownership in middleware and per-query ownership checks. Disable RLS on all tables in the Supabase dashboard or via SQL:
```sql
-- Run this for each table that has RLS enabled
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_sets DISABLE ROW LEVEL SECURITY;
-- ... and so on for all tables
```

---

## 7. Phase 1 — Scaffold the Server

> Goal: a running Express server that returns `{ ok: true }` from `GET /api/health`. No business logic yet.

### 1.1 — `src/config/env.js`
Load `.env` with dotenv. Parse with a Zod schema. Throw at startup if anything is missing:
```js
import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  // ... all other vars
});

export const env = schema.parse(process.env);
```

### 1.2 — `src/lib/logger.js`
```js
import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }   // human-readable in dev
    : undefined,                   // raw JSON in production
});
```

### 1.3 — `src/config/db.js`
```js
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from './env.js';
import * as schema from '../db/schema/index.js';

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
});

pool.on('error', (err) => logger.error({ err }, 'pg pool error'));

export const db = drizzle(pool, { schema });
```

### 1.4 — `src/app.js`
Wire up Express:
- `helmet()` — security headers
- `cors({ origin: env.FRONTEND_URL, credentials: true })` — allow cookies from the frontend
- `cookieParser()` — needed for Better Auth session cookies
- `express.json()` — parse JSON bodies
- `pinoHttp({ logger })` — HTTP request logging with request IDs
- Health route: `GET /api/health → { ok: true, ts: Date.now() }`
- Feature routers (stubbed initially, filled in later phases)
- Global error handler (last)

### 1.5 — `src/middleware/errorHandler.js`
```js
import { logger } from '../lib/logger.js';

export function errorHandler(err, req, res, next) {
  const status = err.status ?? 500;
  if (status >= 500) logger.error({ err, req }, 'Unhandled error');
  res.status(status).json({
    error: {
      message: err.expose ? err.message : 'Internal server error',
      code: err.code ?? 'INTERNAL_ERROR',
    },
  });
}
```

### 1.6 — `src/index.js`
```js
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';

app.listen(env.PORT, () => {
  logger.info(`Server running at http://localhost:${env.PORT}`);
});
```

### 1.7 — Verify
`curl http://localhost:4000/api/health` returns `{ "ok": true }`.

---

## 8. Phase 2 — Database Layer (Drizzle)

> Goal: Drizzle schema files generated from the existing database, ready to use in query files.

### 2.1 — Introspect the existing schema
```bash
cd server
npx drizzle-kit introspect --dialect=postgresql --url=$DATABASE_URL --out=./src/db/schema
```

This generates one JS file per table. Review and organize the output into the schema folder structure shown in Section 4. Export everything from `src/db/schema/index.js`.

### 2.2 — `drizzle.config.js`
```js
import { defineConfig } from 'drizzle-kit';
import { env } from './src/config/env.js';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.js',
  out: './src/db/migrations',
  dbCredentials: { url: env.DATABASE_URL },
});
```

### 2.3 — Query file pattern
Each `*.queries.js` exports async functions. No HTTP concepts — pure data access:
```js
// src/features/comparisons/comparisons.queries.js
import { db } from '../../config/db.js';
import { comparisonSets, comparisonSetItems, comparisonSetAspects } from '../../db/schema/index.js';
import { eq, desc } from 'drizzle-orm';

export async function getComparisonById(id) {
  return db.query.comparisonSets.findFirst({
    where: eq(comparisonSets.id, id),
    with: {
      items: true,
      aspects: true,
    },
  });
}

export async function createComparison({ name, description, items, aspects }, userId) {
  return db.transaction(async (tx) => {
    const [comparison] = await tx.insert(comparisonSets)
      .values({ name, description, userId })
      .returning();
    await tx.insert(comparisonSetItems).values(items.map(i => ({ ...i, setId: comparison.id })));
    await tx.insert(comparisonSetAspects).values(aspects.map(a => ({ ...a, setId: comparison.id })));
    return comparison;
  });
}
```

### 2.4 — RPC functions
The two Supabase RPC calls map directly to raw SQL via Drizzle's `sql` template tag:
```js
import { sql } from 'drizzle-orm';

export async function getPopularAspectSets(userId) {
  return db.execute(sql`SELECT * FROM fetch_popular_aspect_sets_for_user(${userId})`);
}

export async function getFilteredSets({ userId, filter, categoryId, limit }) {
  return db.execute(
    sql`SELECT * FROM get_filtered_sets(${userId}, ${filter}, ${categoryId}, null, ${limit})`
  );
}
```

### 2.5 — Pagination convention
All paginated queries accept `page` (1-based) and `pageSize`. Query files handle the offset calculation:
```js
import { limit as drizzleLimit, offset } from 'drizzle-orm';

export async function getComments(setId, { page = 1, pageSize = 20 }) {
  return db.query.comments.findMany({
    where: eq(comments.setId, setId),
    orderBy: [desc(comments.createdAt)],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
}
```

---

## 9. Phase 3 — Auth (Better Auth)

> Highest-risk phase. Complete, test, and deploy before migrating any other service.

### 8.1 — Why Better Auth over rolling custom JWT

Rolling custom auth requires:
- JWT sign/verify logic
- Refresh token rotation
- Token storage strategy (HttpOnly cookies vs memory)
- Google OAuth redirect + callback + state parameter
- CSRF protection

Better Auth provides all of this out of the box, backed by database sessions (instantly revocable, simpler frontend).

### 8.2 — `src/config/auth.js`
```js
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db.js';
import { env } from './env.js';
import { resend } from '../lib/mailer.js';
import * as schema from '../db/schema/index.js';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: env.EMAIL_FROM,
        to: user.email,
        subject: 'Reset your password',
        html: `<a href="${url}">Reset password</a>`,
      });
    },
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  trustedOrigins: [env.FRONTEND_URL],
});
```

### 8.3 — `src/features/auth/auth.routes.js`
```js
import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../../config/auth.js';

const router = Router();

// Better Auth handles ALL auth endpoints under this mount point:
//   POST /api/auth/sign-in/email
//   POST /api/auth/sign-up/email
//   POST /api/auth/sign-out
//   GET  /api/auth/session
//   POST /api/auth/forget-password
//   POST /api/auth/reset-password
//   GET  /api/auth/sign-in/google (OAuth redirect)
//   GET  /api/auth/callback/google (OAuth callback)
router.all('*', toNodeHandler(auth));

export default router;
```

### 8.4 — `src/middleware/requireAuth.js`
```js
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../config/auth.js';
import createError from 'http-errors';

export async function requireAuth(req, res, next) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) return next(createError(401, 'Authentication required'));
  req.user = session.user;       // { id, email, name, ... }
  req.session = session.session;
  next();
}
```

### 8.5 — `src/middleware/requireOwner.js`
Factory middleware that checks a resource belongs to the authenticated user:
```js
import createError from 'http-errors';

export function requireOwner(getResource) {
  return async (req, res, next) => {
    const resource = await getResource(req.params.id);
    if (!resource) return next(createError(404, 'Not found'));
    if (resource.userId !== req.user.id) return next(createError(403, 'Forbidden'));
    req.resource = resource;
    next();
  };
}
```

### 8.6 — Supabase auth calls → Better Auth endpoints

| Old Supabase call | New Better Auth endpoint |
|---|---|
| `supabase.auth.signUp({ email, password })` | `POST /api/auth/sign-up/email` |
| `supabase.auth.signInWithPassword({ email, password })` | `POST /api/auth/sign-in/email` |
| `supabase.auth.signInWithOAuth({ provider: 'google' })` | `GET /api/auth/sign-in/google` |
| `supabase.auth.getSession()` | `GET /api/auth/session` |
| `supabase.auth.getUser()` | `GET /api/auth/session` (same endpoint) |
| `supabase.auth.signOut()` | `POST /api/auth/sign-out` |
| `supabase.auth.resetPasswordForEmail(email)` | `POST /api/auth/forget-password` |
| `supabase.auth.setSession()` | Handled automatically by Better Auth cookies |
| `supabase.auth.onAuthStateChange()` | Poll `GET /api/auth/session` or check cookie expiry |

### 8.7 — User table migration
Better Auth manages its own `user` and `session` tables. The existing `user_preferences.user_id` currently references Supabase `auth.users(id)`.

**Migration strategy:**
1. Better Auth creates a new `user` table (UUID primary key, same type).
2. For existing users: when they first log in via the new system, the backend looks up their `user_preferences` row by email and links the new Better Auth user ID to it.
3. A one-time script migrates existing `user_preferences` rows so `user_id` points to the new Better Auth user IDs.

This is the most complex part of the auth migration and should be planned carefully before executing.

### 8.8 — Frontend auth changes (`src/services/authService.js`)
The frontend switches from the Supabase JS client to direct fetch calls. Better Auth also has a client SDK (`better-auth/client`) that can be used instead of raw fetch — it mirrors the same session management the Supabase client provided.

```js
// src/lib/authClient.js — replaces src/lib/supabase.js for auth purposes
import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
});
```

Then `src/services/authService.js` uses `authClient.signIn.email(...)`, `authClient.signOut()`, `authClient.getSession()` etc.

### 8.9 — Rate limiting auth endpoints
Add to `src/middleware/rateLimiter.js`:
```js
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: { message: 'Too many attempts, please try again later' } },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
});
```

These are applied as Express middleware before the Better Auth handler in `auth.routes.js`.

---

## 10. Phase 4 — Core API Routes (by service)

Each service is migrated in the order below (safest/simplest first). The pattern for each:

1. Write `*.queries.js` using Drizzle
2. Write `*.controller.js` — req → queries → res
3. Write `*.routes.js` — paths, auth middleware, validation
4. Mount in `src/app.js`
5. Rewrite the corresponding `src/services/*.js` to call the new endpoint
6. Smoke-test the UI

All responses follow this shape:
```json
{ "data": <payload> }
{ "error": { "message": "...", "code": "..." } }
```

---

### 9.1 — Karma (`src/services/karmaService.js`)
**Risk: Low** — read-only, two simple queries

**Queries:**
- `getUserKarma(userId)` — `SELECT * FROM karma_points WHERE user_id = $userId LIMIT 1`
- `getMultipleUsersKarma(userIds[])` — `SELECT * FROM karma_points WHERE user_id IN (...)`

**Routes:**
```
GET /api/karma?userId=          → getUserKarma
GET /api/karma?userIds[]=       → getMultipleUsersKarma
```

---

### 9.2 — Search (`src/services/searchService.js`)
**Risk: Low** — read-only, queries against views

**Queries:**
- `searchSets(q, limit)` — query `popular_comparison_sets` view with ILIKE
- `searchItems(q, limit)` — query `searchable_items` view with ILIKE
- `searchUsers(q, limit)` — query `user_preferences` with ILIKE on username

**Routes:**
```
GET /api/search?q=&type=sets|items|users&limit=
```

---

### 9.3 — Polls (`src/services/polls.js`)
**Risk: Low** — read-only

**Queries:**
- `getUserPolls(userId)` — JOIN comparison_sets + set_categories + votes with GROUP BY

**Routes:**
```
GET /api/polls?userId=
```

---

### 9.4 — Activity (`src/services/userActivityService.js`)
**Risk: Low-Medium** — write-only, single table

**Queries:**
- `logActivity(data)` — INSERT into user_activity_log
- `getUserActivities(userId, limit)` — SELECT from user_activity_log ORDER BY created_at DESC
- `getActivityCount(userId)` — SELECT COUNT(*)

**Routes:**
```
POST   /api/activity                 [auth]
GET    /api/activity?userId=&limit=
GET    /api/activity/count?userId=
```

---

### 9.5 — Products (`src/services/products.js`)
**Risk: Medium** — full CRUD

**Queries:**
- `getProductById(id)` — SELECT with JOIN to item_categories + categories
- `getProducts(userId)` — SELECT WHERE user_id ORDER BY created_at
- `searchProducts(q, limit)` — SELECT WHERE name ILIKE
- `createProduct(data, userId)` — transaction: INSERT item → INSERT item_categories
- `updateProduct(id, data)` — transaction: UPDATE item → DELETE+INSERT item_categories
- `deleteProduct(id)` — DELETE (item_categories cascade)
- `searchCategories(q, limit)` — SELECT WHERE name ILIKE
- `createCategory(name)` — INSERT RETURNING

**Routes:**
```
GET    /api/products/:id
GET    /api/products?userId=&q=&limit=
POST   /api/products                [auth]
PUT    /api/products/:id            [auth, owner]
DELETE /api/products/:id            [auth, owner]
GET    /api/categories?q=&limit=
POST   /api/categories              [auth]
```

---

### 9.6 — Votes (`src/services/votes.js` + `src/services/voting.js`)
**Risk: Medium** — CRUD, existence check before write

**Queries:**
- `getVoteForSet(userId, setId)` — SELECT WHERE user_id AND set_id LIMIT 1
- `getUserVotes(userId)` — SELECT with JOINs on comparison_sets + items ORDER BY created_at
- `getVoteCount(setId, itemId)` — SELECT COUNT(*)
- `castVote(data)` — INSERT RETURNING
- `updateVote(id, itemId)` — UPDATE WHERE id
- `revertVote(id)` — DELETE WHERE id

**Routes:**
```
GET    /api/votes?userId=
GET    /api/votes/check?userId=&setId=
GET    /api/votes/count?setId=&itemId=
POST   /api/votes                   [auth]
PUT    /api/votes/:id               [auth, owner]
DELETE /api/votes/:id               [auth, owner]
```

---

### 9.7 — Reviews (`src/services/reviews.js`)
**Risk: Medium** — CRUD + toggle like (requires transaction)

**Queries:**
- `getItemReviews(itemId, { page, pageSize })` — paginated SELECT with JOIN to user_preferences
- `getUserReviews(userId)` — SELECT with JOIN to items + categories
- `submitReview(data, userId)` — INSERT RETURNING
- `likeReview(reviewId, userId)` — transaction: check existing → INSERT review_likes → UPDATE reviews SET likes = likes + 1
- `unlikeReview(reviewId, userId)` — transaction: DELETE review_likes → UPDATE reviews SET likes = likes - 1
- `getAverageMetrics(itemId)` — SELECT FROM item_metric_averages WHERE item_id

**Routes:**
```
GET    /api/reviews?itemId=&page=&pageSize=
GET    /api/reviews?userId=
POST   /api/reviews                         [auth]
POST   /api/reviews/:id/like               [auth]
DELETE /api/reviews/:id/like               [auth]
GET    /api/items/:id/metrics
```

---

### 9.8 — Comments (`src/services/comments.js` + `src/services/comparisonSetService.js`)
**Risk: Medium** — paginated, nested replies, toggle reaction

**Queries:**
- `getComments(setId, { page, pageSize })` — paginated SELECT with JOINs (user_preferences, reactions, replies)
- `getUserComments(userId, { page, pageSize })` — paginated SELECT with JOINs (comparison_sets, categories)
- `postComment(setId, userId, text)` — INSERT RETURNING
- `postReply(commentId, userId, text)` — INSERT RETURNING
- `reactToComment(commentId, userId, reactionType)` — check existing → toggle: DELETE or INSERT

**Routes:**
```
GET    /api/comparisons/:setId/comments?page=&pageSize=
POST   /api/comparisons/:setId/comments               [auth]
POST   /api/comments/:id/replies                      [auth]
POST   /api/comments/:id/react                        [auth]
DELETE /api/comments/:id/react                        [auth]
GET    /api/users/:userId/comments?page=&pageSize=
```

---

### 9.9 — Comparisons (`src/services/comparisons.js`)
**Risk: High** — multi-table writes, complex queries

**Queries:**
- `getAllComparisons()` — SELECT ORDER BY created_at
- `getUserComparisons(userId)` — SELECT WHERE user_id
- `getUnpublishedComparison(userId)` — SELECT WHERE user_id AND published = false ORDER BY updated_at LIMIT 1
- `getComparisonById(id)` — SELECT with JOINs (items, aspects)
- `createComparison(data, userId)` — transaction: INSERT comparison_sets → INSERT items → INSERT aspects
- `updateComparison(id, data)` — transaction: UPDATE → replace items → upsert aspects
- `updateItems(setId, items)` — transaction: DELETE old → INSERT new
- `updateAspects(setId, aspects)` — UPSERT (ON CONFLICT DO UPDATE)
- `deleteComparison(id)` — DELETE (cascades)

**Routes:**
```
GET    /api/comparisons
GET    /api/comparisons/unpublished      [auth]
GET    /api/comparisons/:id
POST   /api/comparisons                 [auth]
PUT    /api/comparisons/:id             [auth, owner]
DELETE /api/comparisons/:id             [auth, owner]
PUT    /api/comparisons/:id/items       [auth, owner]
PUT    /api/comparisons/:id/aspects     [auth, owner]
```

---

### 9.10 — Users (`src/services/userService.js` + `src/services/users.js`)
**Risk: High** — multi-table reads/writes, account deletion cascade

**Queries:**
- `getUserProfile(id)` — SELECT FROM user_preferences WHERE user_id
- `getActivitySummary(id)` — SELECT FROM user_activity_summary WHERE user_id
- `updateProfile(userId, data)` — UPDATE user_preferences WHERE user_id
- `getNotificationSettings(userId)` — SELECT FROM user_notification_settings WHERE user_id LIMIT 1
- `updateNotificationSettings(userId, settings)` — transaction: DELETE + INSERT
- `getCategoryPreferences(userId)` — SELECT FROM user_category_preferences WHERE user_id
- `updateCategoryPreferences(userId, categoryIds)` — transaction: DELETE + INSERT
- `checkUsernameAvailability(username)` — SELECT WHERE username = $username LIMIT 1
- `deleteAccount(userId)` — transaction: delete all user data in FK order

**Routes:**
```
GET    /api/users/:id
GET    /api/users/:id/activity-summary
PUT    /api/users/me                            [auth]
GET    /api/users/me/notifications              [auth]
PUT    /api/users/me/notifications              [auth]
GET    /api/users/me/category-preferences       [auth]
PUT    /api/users/me/category-preferences       [auth]
GET    /api/users/check-username?username=
DELETE /api/users/me                            [auth]
```

---

### 9.11 — Trending (`src/contexts/TrendingContext.jsx`)
**Risk: Low** — wraps existing Postgres functions

**Queries:**
- `getPopularAspectSets(userId)` — `SELECT * FROM fetch_popular_aspect_sets_for_user($1)`
- `getFilteredSets(params)` — `SELECT * FROM get_filtered_sets($1, $2, $3, $4, $5)`

**Routes:**
```
GET    /api/trending?userId=
GET    /api/sets?userId=&filter=&categoryId=&limit=
```

---

### 9.12 — Feedback (`src/services/feedbackService.js`)
**Risk: Medium** — involves file upload

**Queries:**
- `listFeedback()` — SELECT ORDER BY created_at
- `getFeedback(id)` — SELECT WHERE id
- `submitFeedback(data)` — INSERT RETURNING (image_url comes from upload endpoint)
- `updateFeedbackStatus(id, status)` — UPDATE WHERE id
- `deleteFeedback(id)` — DELETE WHERE id

**Routes:**
```
GET    /api/feedback                [admin]
GET    /api/feedback/:id            [admin]
POST   /api/feedback
PUT    /api/feedback/:id/status     [admin]
DELETE /api/feedback/:id            [admin]
```

---

## 11. Phase 5 — File Storage

> Replace Supabase Storage (buckets: `feedback-images`, `product-pics`, `profile-pics`)

### 10.1 — Storage driver abstraction (`src/config/storage.js`)
A thin wrapper that returns a configured Multer instance. The driver switches via `STORAGE_DRIVER` env var:

**Local driver:**
```js
import multer from 'multer';
import path from 'path';

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(env.UPLOAD_DIR, req.body.bucket ?? 'misc')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
export const upload = multer({ storage: localStorage });
```

**S3 driver:**
```js
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: env.AWS_REGION });
const s3Storage = multerS3({
  s3,
  bucket: env.AWS_BUCKET,
  key: (req, file, cb) => cb(null, `${req.body.bucket}/${Date.now()}-${file.originalname}`),
  acl: 'public-read',
});
export const upload = multer({ storage: s3Storage });
```

`env.STORAGE_DRIVER` selects which export is used.

### 10.2 — Upload route (`src/features/uploads/`)
```
POST /api/uploads
  Content-Type: multipart/form-data
  Fields: file (binary), bucket (string: "feedback-images" | "product-pics" | "profile-pics")
  Returns: { data: { url: "https://..." } }
```

Express serves local uploads: `app.use('/uploads', express.static(env.UPLOAD_DIR))`.

### 10.3 — Frontend upload change
All three storage patterns in the frontend become:
```js
// Before (Supabase Storage)
await supabase.storage.from('product-pics').upload(path, file)
const { data } = supabase.storage.from('product-pics').getPublicUrl(path)

// After
const form = new FormData();
form.append('file', file);
form.append('bucket', 'product-pics');
const { data } = await apiClient.post('/api/uploads', form);
return data.url;
```

Existing Supabase Storage URLs in the DB remain accessible (Supabase Storage stays read-accessible) and are migrated lazily as users update their profiles/products.

---

## 12. Phase 6 — Frontend Service Rewrites

### 11.1 — API client (`src/lib/apiClient.js`)
Axios is already in the project (`package.json`). Create a singleton with Better Auth session awareness:
```js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,   // sends Better Auth session cookie automatically
});

export default apiClient;
```

No interceptors needed for token refresh — Better Auth handles sessions via cookies. The session cookie is `HttpOnly` and is sent automatically on every request. If the session expires, the server returns 401 and `authClient.getSession()` returns null, triggering logout in `AuthContext`.

### 11.2 — Auth client (`src/lib/authClient.js`)
```js
import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
});
```

### 11.3 — Migration order

| Order | Service file | Risk | Reason |
|---|---|---|---|
| 1 | `karmaService.js` | Low | Read-only, tiny |
| 2 | `searchService.js` | Low | Read-only |
| 3 | `polls.js` | Low | Read-only |
| 4 | `userActivityService.js` | Low | Write-only, no reads |
| 5 | `products.js` | Medium | CRUD + category join |
| 6 | `votes.js` + `voting.js` | Medium | CRUD + existence check |
| 7 | `reviews.js` | Medium | CRUD + like toggle |
| 8 | `comments.js` + `comparisonSetService.js` | Medium | Pagination + reactions |
| 9 | `comparisons.js` | High | Multi-table transaction |
| 10 | `userService.js` + `users.js` | High | Account deletion |
| 11 | `feedbackService.js` | Medium | File upload |
| 12 | `authService.js` | Critical | Identity — do last |

### 11.4 — Service rewrite pattern
Exported function signatures stay identical. Only the body changes:

```js
// BEFORE (Supabase)
export async function getUserKarma(userId) {
  const { data, error } = await supabase
    .from('karma_points').select('*').eq('user_id', userId).single();
  if (error) throw error;
  return data;
}

// AFTER (API client)
export async function getUserKarma(userId) {
  const { data } = await apiClient.get('/api/karma', { params: { userId } });
  return data.data;
}
```

Hooks calling `getUserKarma()` are untouched.

### 11.5 — `src/contexts/TrendingContext.jsx`
Replace `supabase.rpc('fetch_popular_aspect_sets_for_user', ...)` with `apiClient.get('/api/trending', ...)` and `supabase.rpc('get_filtered_sets', ...)` with `apiClient.get('/api/sets', ...)`.

### 11.6 — `src/contexts/AuthContext.jsx` + `src/hooks/useAuthHook.js`
Replace `supabase.auth.*` calls with `authClient.*` from Better Auth client SDK. The session shape changes slightly — verify all fields consumed by `AuthContext` and `useAuthHook` match what `authClient.getSession()` returns.

---

## 13. Phase 7 — Vite Proxy & Environment

### 12.1 — `vite.config.js` proxy block
```js
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
    },
    '/uploads': {
      target: 'http://localhost:4000',
      changeOrigin: true,
    },
  },
},
```

In production, a reverse proxy (nginx / Cloudflare / load balancer) handles this. The Vite proxy is dev-only.

### 12.2 — Frontend `.env` final state

```bash
VITE_BASE_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000   # same origin → Vite proxies to :4000
# VITE_SUPABASE_URL — REMOVED
# VITE_SUPABASE_ANON_KEY — REMOVED
```

---

## 14. Phase 8 — Cleanup & Hardening

### 13.1 — Remove Supabase
- `npm uninstall @supabase/supabase-js` (root)
- Delete `src/lib/supabase.js`
- Remove Supabase env vars from all `.env` files
- Remove Supabase CLI if it was only used for the anon key

### 13.2 — Input validation on every mutating route
Each POST/PUT route applies the `validate` middleware before the controller:
```js
// src/middleware/validate.js
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return next(createError(400, result.error.flatten()));
  req.body = result.data;
  next();
};
```

### 13.3 — Authorization on every owner-protected route
`requireOwner` (defined in Phase 3) is applied in the route file, not the controller. The controller can assume `req.resource` is already verified:
```js
router.delete('/:id', requireAuth, requireOwner(getProductById), destroy);
```

### 13.4 — Security headers
`helmet()` already applied in Phase 1. Review the CSP header to allow the frontend's CDN assets and inline styles if Tailwind uses them.

### 13.5 — Database query review
After all routes are live, run `EXPLAIN ANALYZE` on the five most-used queries. Add indices if any show sequential scans on large tables. The existing Supabase SQL files already define most indices — verify they transferred correctly.

### 13.6 — CORS final configuration
```js
cors({
  origin: env.FRONTEND_URL,
  credentials: true,            // allows cookies (Better Auth sessions)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
})
```

### 13.7 — Production logging
Replace `pino-pretty` transport with raw JSON output (already handled by the `NODE_ENV` check in `lib/logger.js`). Pipe logs to a log aggregator (Datadog, Logtail, or CloudWatch).

### 13.8 — Serve frontend in production
Optionally serve Vite's `dist/` from the same Express server:
```js
import { fileURLToPath } from 'url';
const distPath = path.resolve(fileURLToPath(import.meta.url), '../../dist');
app.use(express.static(distPath));
app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
```
This handles client-side routing (React Router) for all non-API paths.

---

## 15. API Contract Reference

| Method | Path | Auth? | Description |
|---|---|---|---|
| GET | /api/health | No | Health check |
| POST | /api/auth/sign-up/email | No | Register |
| POST | /api/auth/sign-in/email | No | Login |
| GET | /api/auth/sign-in/google | No | Google OAuth redirect |
| GET | /api/auth/callback/google | No | Google OAuth callback |
| GET | /api/auth/session | Cookie | Get current session |
| POST | /api/auth/sign-out | Cookie | Logout |
| POST | /api/auth/forget-password | No | Send reset email |
| POST | /api/auth/reset-password | No | Set new password |
| GET | /api/products/:id | No | Get product |
| GET | /api/products | No | List / search products |
| POST | /api/products | Yes | Create product |
| PUT | /api/products/:id | Yes + owner | Update product |
| DELETE | /api/products/:id | Yes + owner | Delete product |
| GET | /api/categories | No | Search categories |
| POST | /api/categories | Yes | Create category |
| GET | /api/comparisons | No | List comparisons |
| GET | /api/comparisons/unpublished | Yes | Get draft |
| GET | /api/comparisons/:id | No | Get comparison |
| POST | /api/comparisons | Yes | Create comparison |
| PUT | /api/comparisons/:id | Yes + owner | Update comparison |
| DELETE | /api/comparisons/:id | Yes + owner | Delete comparison |
| PUT | /api/comparisons/:id/items | Yes + owner | Replace items |
| PUT | /api/comparisons/:id/aspects | Yes + owner | Replace/upsert aspects |
| GET | /api/votes | Yes | Get user's votes |
| GET | /api/votes/check | No | Check vote for a set |
| GET | /api/votes/count | No | Get vote count |
| POST | /api/votes | Yes | Cast vote |
| PUT | /api/votes/:id | Yes + owner | Update vote |
| DELETE | /api/votes/:id | Yes + owner | Revert vote |
| GET | /api/reviews | No | Get item reviews (paginated) |
| POST | /api/reviews | Yes | Submit review |
| POST | /api/reviews/:id/like | Yes | Like review |
| DELETE | /api/reviews/:id/like | Yes | Unlike review |
| GET | /api/items/:id/metrics | No | Get average metrics |
| GET | /api/comparisons/:setId/comments | No | Get comments (paginated) |
| POST | /api/comparisons/:setId/comments | Yes | Post comment |
| POST | /api/comments/:id/replies | Yes | Post reply |
| POST | /api/comments/:id/react | Yes | React to comment |
| DELETE | /api/comments/:id/react | Yes | Remove reaction |
| GET | /api/users/:id | No | Get user profile |
| GET | /api/users/:id/activity-summary | No | Get activity summary |
| PUT | /api/users/me | Yes | Update own profile |
| GET | /api/users/me/notifications | Yes | Get notification settings |
| PUT | /api/users/me/notifications | Yes | Update notification settings |
| GET | /api/users/me/category-preferences | Yes | Get category prefs |
| PUT | /api/users/me/category-preferences | Yes | Update category prefs |
| GET | /api/users/check-username | No | Check username availability |
| DELETE | /api/users/me | Yes | Delete account |
| GET | /api/activity | Yes | Get user activities |
| POST | /api/activity | Yes | Log activity |
| GET | /api/activity/count | Yes | Get activity count |
| GET | /api/karma | No | Get karma |
| GET | /api/search | No | Search sets / items / users |
| GET | /api/polls | Yes | Get user's polls |
| GET | /api/trending | No | Trending sets for user |
| GET | /api/sets | No | Filtered sets (home feed) |
| GET | /api/feedback | Admin | List feedback |
| GET | /api/feedback/:id | Admin | Get feedback |
| POST | /api/feedback | No | Submit feedback |
| PUT | /api/feedback/:id/status | Admin | Update status |
| DELETE | /api/feedback/:id | Admin | Delete feedback |
| POST | /api/uploads | Yes | Upload file to storage |

---

## 16. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **User ID mismatch** — existing `user_preferences.user_id` references Supabase `auth.users` UUIDs; Better Auth creates new user IDs | High | Critical | Better Auth user IDs are also UUIDs. Write a one-time migration script that maps old Supabase user IDs → Better Auth user IDs by email. Run in a transaction. Test on a DB snapshot first. |
| **RLS blocks direct pg connection** — Supabase RLS policies reject the service role connection | Medium | High | Disable RLS on all tables before enabling the backend (Phase 0.5). The server is the trusted layer. |
| **Google OAuth session mismatch** — users who signed in with Google via Supabase will have no matching Better Auth session | High | Medium | Keep Supabase Auth active for OAuth until Better Auth Google provider is live. After go-live, users re-authenticate once via the Google button which now hits Better Auth. |
| **Supabase Storage URL rot** — existing `image_url` values in the DB point to Supabase Storage CDN URLs | Medium | Medium | Keep Supabase Storage read-accessible. Migrate URLs lazily as users update their content. No bulk migration needed. |
| **Drizzle schema drift** — introspected schema may differ from actual DB if migrations ran outside the schema files | Low | Medium | Run `drizzle-kit introspect` against production; review the diff carefully. |
| **Missing DB indices** — queries that Supabase hid behind abstractions may do full table scans | Low | Medium | Run `EXPLAIN ANALYZE` on the top 10 queries after each service is migrated. |
| **Better Auth session table collisions** — Better Auth needs to create its own `user` and `session` tables which may conflict with existing table names | Low | Low | Review Better Auth's expected schema before running migrations. Rename collisions in Drizzle adapter config. |
| **CORS cookie issues on mobile** — Capacitor WebView may not send the session cookie | Medium | Medium | Test on Capacitor after auth migration. May need to switch to header-based sessions for mobile builds using Better Auth's bearer token plugin. |
