# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo shape

This is **two workspaces in one repo**:

- **Root** (`/`) — Vite + React 18 + Tailwind frontend. Ships as a web app and as native iOS/Android via Capacitor.
- **`server/`** — Express 5 API (Node, ESM) with Better Auth, Drizzle ORM, and PostgreSQL.

Each workspace has its own `package.json`, its own `node_modules`, and its own lint/test config. Treat them as independent npm projects that happen to live in one repo.

> **Migration note.** The backend was migrated off Supabase to a self-hosted Express + Drizzle + Better Auth stack over Sprints 1–15 (see `SPRINT_TRACKER.md` and `REFACTOR_PLAN.md`). The migration is one-way; do not wire Supabase as a fallback or parallel path.

## Common commands

Run from repo root unless noted.

```bash
# Dev — `make dev` is preferred (kills stale ports, brings up Postgres + waits, then runs npm run dev).
# Ports (chosen to avoid common clashes): frontend :5734, server :8734, Postgres host :7432.
make dev
npm run dev      # without Postgres bootstrapping; you must already have Postgres up

# Individually
npm run dev:client       # vite only
npm run dev:server       # server only (delegates to server/)

# Lint (each workspace lints itself; both must pass)
npm run lint             # frontend (eslint . --max-warnings 0)
npm --prefix server run lint

# Server tests (vitest)
npm --prefix server test                                    # all
npm --prefix server exec vitest run path/to/file.test.js    # single file
npm --prefix server run test:watch

# Frontend tests — jest is configured (jest.config.js) but there is no `npm test` script.
# Run with: npx jest <path>

# DB (run from server/ or use --prefix server)
docker compose up -d                                # local Postgres 16 on host :7432
npm --prefix server run db:generate                 # drizzle-kit generate
npm --prefix server run db:studio                   # drizzle-kit studio
# Migrations auto-run on server boot via server/src/db/migrate.js — no separate `migrate` command.

# Seed local DB with 6 persona logins (alex/jordan/priya/marcus/sam/riley + comparisons/votes/comments/reviews)
# Requires Postgres + server running; see devSeedScripts/README.md for the persona reference.
npm run seed

# Production builds
npm run web:build         # dev mode build
npm run web:build:stage
npm run web:build:prod

# Capacitor (web build → sync → open native IDE)
npm run ios:dev           # also: ios:stage, ios:prod
npm run android:dev       # also: android:stage, android:prod
```

The Vite dev server proxies `/api/*` to `http://localhost:8734`, so the frontend can call absolute `/api/...` paths in both dev and prod.

## Environment

- **Frontend** (`.env` at root): `VITE_BASE_URL`, `VITE_API_URL`. `VITE_API_URL` is origin-only (no `/api` suffix) because services already use absolute `/api/...` paths via `src/lib/apiClient.js`.
- **Server** (`server/.env`): validated by `server/src/config/env.js` (Zod). Required: `DATABASE_URL`, `BETTER_AUTH_SECRET` (32+ bytes), `BETTER_AUTH_URL`. Optional: Google OAuth, Resend (email), S3 storage. `server/.env.example` is the canonical reference.

## Backend architecture (`server/src/`)

Feature-folder convention. Each `features/<name>/` contains:

```
<name>.routes.js       # Express Router, mounted in app.js
<name>.controller.js   # Request handlers — call queries, shape responses
<name>.queries.js      # Drizzle queries — the only layer that touches db
<name>.schema.js       # Zod request schemas (where used)
<name>.*.test.js       # Vitest unit tests, colocated
```

`server/src/app.js` is the single place that mounts routers under `/api/<feature>`. Read it to see the full surface.

**Critical mount order in `app.js`:** `/api/auth` (Better Auth) is mounted **before** `express.json()` because Better Auth reads the raw request stream. Do not move it.

**Route ordering inside a router:** static paths come before `/:id` (e.g. `/unpublished` before `/:id`) — Express matches in order and `/:id` will otherwise capture them. See `features/comparisons/comparisons.routes.js` for the pattern.

**Auth middleware** (`server/src/middleware/`):
- `requireAuth` — sets `req.user`, `req.session`; 401 if missing
- `optionalAuth` — same but doesn't fail; used for endpoints with logged-in vs anon variants
- `requireOwner(loaderFn)` — pairs with `requireAuth`; loads the resource and checks ownership
- `requireAdmin` — checks `env.ADMIN_USER_IDS`
- `validate(schema)` — Zod request validation

**Error handling.** Throw `http-errors` (`createError(400, 'bad')`); `errorHandler` formats every response as `{ error: { message, code } }`. Status ≥500 hides the real message in the response (logged server-side via pino). Clients see this shape consistently — the frontend `apiClient` interceptor reads `error.message`/`error.code` from it.

**Database.** Drizzle ORM + `pg` Pool. Schemas live in `server/src/db/schema/` and are re-exported from `index.js` (barrel). Migrations are SQL files in `server/src/db/migrations/`, generated by `drizzle-kit generate`, and applied automatically when the server starts (see `db/migrate.js` called from `index.js`).

**Auth.** Better Auth with the Drizzle adapter (`server/src/config/auth.js`). Email/password + Google OAuth (when configured) + Resend transactional email (when configured).

## Frontend architecture (`src/`)

React 18 + React Router 7 + Tailwind. Mobile-first; same bundle ships to web and native (Capacitor).

**Context stack** in `App.jsx` (outer → inner): `LoadingProvider` → `BrowserRouter` → `AuthProvider` → `ThemeProvider` → `HeaderProvider` → `FeedbackProvider` → `BetaTestingProvider` → `MotionConfig`. `NativeStatusBar` lives inside `ThemeProvider` and updates Capacitor's status bar style from the current theme — only runs on native platforms.

**Service layer** (`src/services/`). Every API call goes through a service module; components never call `apiClient` directly. Services use absolute `/api/...` paths (`apiClient`'s `baseURL` is origin-only). See **Known debt** below for legacy violations — do not add to them.

**Theming.** Tokens drive all colors via `ThemeContext`. Components must read theme tokens — never hardcode colors. Adding a theme = adding one token object; no component changes.

**Vite aliases** (configured in `vite.config.js`):
```
@           → ./src
@components → ./src/components
@hooks      → ./src/hooks
@styles     → ./src/styles
@utils      → ./src/lib       (note: @utils maps to lib/, not utils/)
@contexts   → ./src/contexts
@services   → ./src/services
```

**Capacitor.** Safe-area insets and touch behavior are handled at the component level; the same React tree runs on web, iOS, and Android. Build configs: `web:build` (dev), `web:build:stage`, `web:build:prod` correspond to Vite modes loaded via `loadEnv`.

## Planning & sprint tracking

There are three living planning docs at the repo root:

- **`REFACTOR_PLAN.md`** — backend migration only (Supabase → self-hosted Express + Drizzle).
- **`UI_REDESIGN_PLAN.md`** — frontend redesign only.
- **`SPRINT_PLAN.md`** — sequences the 15 vertical sprints that span both.
- **`SPRINT_TRACKER.md`** — live progress board. **This is the source of truth for "what's done"**, not chat memory. Update it (`[ ]` → `[~]` → `[x]`, plus the `Last updated` timestamp at the top) as work progresses. The protocol is documented at the top of the file.

Per current convention, all sprint work lands on the `backend-add` branch as sequential commits — one eventual PR to `main` rather than per-sprint PRs.

## Conventions worth knowing

- **No Supabase fallbacks.** The backend migration is one-way; do not wire Supabase as a parallel or rollback path. Transitional code is fine during a sprint; fallback wiring is not.
- **Lint baseline is zero errors / zero warnings.** Both workspaces run with `--max-warnings 0`. Don't merge red lint.
- **ESM everywhere.** Both `package.json` files declare `"type": "module"`. Use `import`/`export`, including in config files (`.cjs` only where a tool requires it, e.g. `.eslintrc.cjs`).
- **One-line API error contract.** Server always returns `{ error: { message, code } }`; frontend `apiClient` surfaces `err.message`/`err.code` from that shape. Preserve it on both sides.

## Known debt

These are documented exceptions, not patterns to follow. **New code must follow the conventions above** — past violations are not a license for future ones. Migrate opportunistically when you touch one of these files for another reason; do not start a dedicated cleanup sprint until the user asks.

### Direct `apiClient` use outside the service layer

18 files (~46 call sites) bypass the service layer and call `apiClient` directly. They work — they hit correct endpoints — but they violate the "components/hooks/contexts never touch `apiClient`" rule.

Highest concentrations (migrate these first when the opportunity arises):

| File | Calls | Domain |
|---|---|---|
| `src/hooks/useComparisonSets.js` | 9 | comparisons + votes |
| `src/hooks/useComparisonAspectDetails.js` | 7 | aspects + votes |
| `src/pages/settings-page/tabs/ProfileSettings.jsx` | 5 | users + uploads |
| `src/hooks/useComparisonData.js` | 5 | aspects + votes |
| `src/hooks/useComparisonAspectData.js` | 5 | aspects + votes |
| `src/pages/user-dashboard-page/activity.js` | 4 | activity |
| `src/pages/product-details/tabs/CommentAppearancesTab.jsx` | 3 | items |

The rest is a long tail of 1–2-call files across `pages/` and `contexts/`.

**Rules going forward:**
- Any new feature work introduces zero new violations.
- When touching a file in the list above, prefer to migrate its calls in the same change rather than adding more inline ones.
- The `votes` family is the natural first cleanup pass — most direct calls are `POST/DELETE /api/votes` repeated across 5 hooks. Consolidating them into `src/services/votes.js` is ~1 day of work.
- Acceptance criterion for "done": `grep -rn "apiClient\." src/ --include='*.js' --include='*.jsx' | grep -v "src/services/\|src/lib/"` returns nothing.
