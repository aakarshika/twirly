# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo shape

pnpm workspaces monorepo with four top-level areas:

```
twirly/
├── apps/
│   ├── web/       ← Vite + React 18 + Tailwind frontend (@twirly/web)
│   └── api/       ← Express 5 API, Drizzle ORM, Better Auth, PostgreSQL (@twirly/api)
├── packages/
│   └── shared/    ← Zod schemas + error codes shared between apps (@twirly/shared)
├── native/
│   ├── ios/       ← Capacitor iOS shell (Xcode project)
│   └── android/   ← Capacitor Android shell (Gradle project)
├── capacitor.config.json    ← webDir = apps/web/dist; ios.path/android.path point into native/
├── pnpm-workspace.yaml      ← packages: ["apps/*", "packages/*"]
├── .npmrc                   ← public-hoist-pattern[]=@capacitor/* (see "Capacitor hoist" below)
├── Makefile                 ← `make dev` brings up Postgres + both servers
└── package.json             ← orchestration scripts only (concurrently + @capacitor/* deps)
```

**The Express API is a peer of the web app**, not subordinate to it. All three clients (web browser, iOS, Android) send identical HTTP requests to the same `/api/*` endpoints. Don't reintroduce mental models where `apps/api/` is "the web app's server."

> **Migration history.** The backend was migrated off Supabase to a self-hosted Express + Drizzle + Better Auth stack over Sprints 1–15. The repo was then restructured from `root + server/` into the pnpm monorepo layout above in Sprint 16 (`MONOREPO_MIGRATION.md`). Both migrations are one-way; do not wire Supabase as a fallback, and do not reintroduce the old flat layout.

## Common commands

Run from repo root unless noted.

```bash
# Dev — `make dev` is preferred (kills stale ports, brings up Postgres + waits, then runs pnpm run dev).
# Ports (chosen to avoid common clashes): web :5734, api :8734, Postgres host :7432.
make dev
pnpm run dev             # without Postgres bootstrapping; you must already have Postgres up

# Individually
pnpm run dev:web         # web only (delegates to apps/web)
pnpm run dev:api         # api only (delegates to apps/api)

# Lint (each workspace lints itself; both must pass — pnpm -r runs them in parallel)
pnpm -r lint
pnpm --filter @twirly/web lint
pnpm --filter @twirly/api lint

# API tests (vitest)
pnpm --filter @twirly/api test                                  # all
pnpm --filter @twirly/api exec vitest run path/to/file.test.js  # single file
pnpm --filter @twirly/api run test:watch

# Frontend tests — jest is configured (jest.config.js) but there is no `test` script.
# Run with: pnpm --filter @twirly/web exec jest <path>

# DB
docker compose up -d                                # local Postgres 16 on host :7432
pnpm --filter @twirly/api run db:generate           # drizzle-kit generate
pnpm --filter @twirly/api run db:studio             # drizzle-kit studio
# Migrations auto-run on api boot via apps/api/src/db/migrate.js — no separate `migrate` command.

# Seed local DB with 6 persona logins (alex/jordan/priya/marcus/sam/riley + comparisons/votes/comments/reviews)
# Requires Postgres + api running; see devSeedScripts/README.md for the persona reference.
pnpm run seed

# Production builds (web only)
pnpm run build           # dev mode (forwards to @twirly/web)
pnpm run build:stage
pnpm run build:prod

# Capacitor (web build → sync → open native IDE)
pnpm run ios:dev         # also: ios:stage, ios:prod
pnpm run android:dev     # also: android:stage, android:prod
```

The Vite dev server proxies `/api/*` to `http://localhost:8734`, so the frontend can call absolute `/api/...` paths in both dev and prod.

## Environment

- **Frontend** (`apps/web/.env`): `VITE_BASE_URL`, `VITE_API_URL`. `VITE_API_URL` is origin-only (no `/api` suffix) because services already use absolute `/api/...` paths via `apps/web/src/lib/apiClient.js`. Loaded by Vite via `loadEnv(mode, process.cwd(), '')`; cwd is `apps/web/` because pnpm runs the script in the package's own directory.
- **Server** (`apps/api/.env`): validated by `apps/api/src/config/env.js` (Zod). Required: `DATABASE_URL`, `BETTER_AUTH_SECRET` (32+ bytes), `BETTER_AUTH_URL`. Optional: Google OAuth, Resend (email), S3 storage. `apps/api/.env.example` is the canonical reference.

## Package manager

pnpm, pinned to a specific version via `packageManager` in root `package.json`. Activate via corepack: `corepack enable && corepack prepare pnpm@9 --activate`.

There is one lock file: `pnpm-lock.yaml` at repo root. Do not run `npm install` or `yarn install` — both will create a competing lock and break workspace symlinks. If you see a stray `package-lock.json` anywhere, delete it.

### Capacitor hoist

`.npmrc` at root contains `public-hoist-pattern[]=@capacitor/*`. This forces pnpm to flatten all `@capacitor/*` packages into the root `node_modules/`, where:

1. The iOS Podfile finds them at `../../../node_modules/@capacitor/*` (relative to `native/ios/App/Podfile`).
2. Android's regenerated `capacitor.settings.gradle` walks the same root.
3. `npx cap …` finds the CLI at `node_modules/.bin/cap`.
4. Frontend JS imports of `@capacitor/{core,status-bar,app,share}` from `apps/web/src/` resolve via Node's parent-dir `node_modules` walk-up.

`@capacitor/*` packages live in **root** `package.json`'s `dependencies`, not `apps/web/`. The reasoning: Capacitor's CLI reads plugin declarations from the package.json adjacent to `capacitor.config.json` (which lives at root). Don't move them back to apps/web — `cap sync` will lose plugin discovery.

## Backend architecture (`apps/api/src/`)

Feature-folder convention. Each `features/<name>/` contains:

```
<name>.routes.js       # Express Router, mounted in app.js
<name>.controller.js   # Request handlers — call queries, shape responses
<name>.queries.js      # Drizzle queries — the only layer that touches db
<name>.schema.js       # Zod request schemas (where used) — re-exports from @twirly/shared
<name>.*.test.js       # Vitest unit tests, colocated
```

`apps/api/src/app.js` is the single place that mounts routers under `/api/<feature>`. Read it to see the full surface.

**Critical mount order in `app.js`:** `/api/auth` (Better Auth) is mounted **before** `express.json()` because Better Auth reads the raw request stream. Do not move it.

**Route ordering inside a router:** static paths come before `/:id` (e.g. `/unpublished` before `/:id`) — Express matches in order and `/:id` will otherwise capture them. See `apps/api/src/features/comparisons/comparisons.routes.js` for the pattern.

**Auth middleware** (`apps/api/src/middleware/`):
- `requireAuth` — sets `req.user`, `req.session`; 401 if missing
- `optionalAuth` — same but doesn't fail; used for endpoints with logged-in vs anon variants
- `requireOwner(loaderFn)` — pairs with `requireAuth`; loads the resource and checks ownership
- `requireAdmin` — checks `env.ADMIN_USER_IDS`
- `validate(schema)` — Zod request validation

**Error handling.** Throw `http-errors` (`createError(400, 'bad')`); `errorHandler` formats every response as `{ error: { message, code } }` and pulls `code` defaults from `@twirly/shared/error-codes`. Status ≥500 hides the real message in the response (logged server-side via pino). Clients see this shape consistently — the frontend `apiClient` interceptor reads `error.message`/`error.code` from it.

**Database.** Drizzle ORM + `pg` Pool. Schemas live in `apps/api/src/db/schema/` and are re-exported from `index.js` (barrel). Migrations are SQL files in `apps/api/src/db/migrations/`, generated by `drizzle-kit generate`, and applied automatically when the api starts (see `db/migrate.js` called from `index.js`).

**Static SQL (views, functions).** Lives in `apps/api/sql/ddl/`. These are **not managed by Drizzle migrations** — they contain complex SQL (time-decay scoring, statistical aggregates) that must not be accidentally dropped or regenerated. Apply them manually to fresh environments per REFACTOR_PLAN.md §4.3–§4.4.

**Auth.** Better Auth with the Drizzle adapter (`apps/api/src/config/auth.js`). Email/password + Google OAuth (when configured) + Resend transactional email (when configured).

## Frontend architecture (`apps/web/src/`)

React 18 + React Router 7 + Tailwind. Mobile-first; same bundle ships to web and native (Capacitor).

**Context stack** in `App.jsx` (outer → inner): `LoadingProvider` → `BrowserRouter` → `AuthProvider` → `ThemeProvider` → `HeaderProvider` → `FeedbackProvider` → `BetaTestingProvider` → `MotionConfig`. `NativeStatusBar` lives inside `ThemeProvider` and updates Capacitor's status bar style from the current theme — only runs on native platforms.

**Service layer** (`apps/web/src/services/`). Every API call goes through a service module; components never call `apiClient` directly. Services use absolute `/api/...` paths (`apiClient`'s `baseURL` is origin-only). See **Known debt** below for legacy violations — do not add to them.

**Theming.** Tokens drive all colors via `ThemeContext`. Components must read theme tokens — never hardcode colors. Adding a theme = adding one token object; no component changes.

**Vite aliases** (configured in `apps/web/vite.config.js`):
```
@           → ./src
@components → ./src/components
@hooks      → ./src/hooks
@styles     → ./src/styles
@utils      → ./src/lib       (note: @utils maps to lib/, not utils/)
@contexts   → ./src/contexts
@services   → ./src/services
```

These resolve via `__dirname` from inside `apps/web/vite.config.js`, so `@` is `apps/web/src/` at the OS level. Do not hardcode `apps/web/src/...` in your code — use the alias.

**Capacitor.** Safe-area insets and touch behavior are handled at the component level; the same React tree runs on web, iOS, and Android. Build configs: `build` (dev), `build:stage`, `build:prod` correspond to Vite modes loaded via `loadEnv`.

## Shared package (`packages/shared/src/`)

Centralizes things that genuinely live in both `apps/api` and `apps/web`. Pure ESM, no build step, consumed via the `exports` map in `packages/shared/package.json`.

Current contents:
- `schemas/{comments,products,votes,reviews}.js` — Zod request schemas. The corresponding `apps/api/src/features/*/`.schema.js files thinly re-export from here so server-side imports stay colocated.
- `error-codes.js` — the `ERROR_CODES` enum used by `apps/api/src/middleware/errorHandler.js`. The frontend may later branch on these via `err.code` from the apiClient response envelope.

Resist over-sharing. Auth helpers, Drizzle queries, and React hooks all belong in their respective workspace. Only platform-agnostic types/constants/validation go here.

## Planning & sprint tracking

Living planning docs at the repo root:

- **`REFACTOR_PLAN.md`** — backend migration only (Supabase → self-hosted Express + Drizzle).
- **`UI_REDESIGN_PLAN.md`** — frontend redesign only.
- **`SPRINT_PLAN.md`** — sequences the 15 vertical sprints that span both.
- **`SPRINT_TRACKER.md`** — live progress board. **This is the source of truth for "what's done"**, not chat memory. Update it (`[ ]` → `[~]` → `[x]`, plus the `Last updated` timestamp at the top) as work progresses. The protocol is documented at the top of the file.
- **`MONOREPO_MIGRATION.md`** — Sprint 16 tracker for the pnpm monorepo restructure (M1–M6 sub-sprints).

Per current convention, all sprint work lands on the `backend-add` branch as sequential commits — one eventual PR to `main` rather than per-sprint PRs.

## Conventions worth knowing

- **No Supabase fallbacks.** The backend migration is one-way; do not wire Supabase as a parallel or rollback path. Transitional code is fine during a sprint; fallback wiring is not.
- **Lint baseline is zero errors / zero warnings.** All workspaces run with `--max-warnings 0`. Don't merge red lint.
- **ESM everywhere.** All `package.json` files declare `"type": "module"`. Use `import`/`export`, including in config files (`.cjs` only where a tool requires it, e.g. `apps/web/.eslintrc.cjs`).
- **One-line API error contract.** Server always returns `{ error: { message, code } }`; frontend `apiClient` surfaces `err.message`/`err.code` from that shape. Codes are defined in `@twirly/shared/error-codes`. Preserve the envelope on both sides.
- **One lock file.** `pnpm-lock.yaml` at root. No `package-lock.json` or `yarn.lock` anywhere.
- **`@capacitor/*` deps live at root**, not apps/web. See "Capacitor hoist" above for why.

## Known debt

These are documented exceptions, not patterns to follow. **New code must follow the conventions above** — past violations are not a license for future ones. Migrate opportunistically when you touch one of these files for another reason; do not start a dedicated cleanup sprint until the user asks.

### Direct `apiClient` use outside the service layer

18 files (~46 call sites) bypass the service layer and call `apiClient` directly. They work — they hit correct endpoints — but they violate the "components/hooks/contexts never touch `apiClient`" rule.

Highest concentrations (migrate these first when the opportunity arises):

| File | Calls | Domain |
|---|---|---|
| `apps/web/src/hooks/useComparisonSets.js` | 9 | comparisons + votes |
| `apps/web/src/hooks/useComparisonAspectDetails.js` | 7 | aspects + votes |
| `apps/web/src/pages/settings-page/tabs/ProfileSettings.jsx` | 5 | users + uploads |
| `apps/web/src/hooks/useComparisonData.js` | 5 | aspects + votes |
| `apps/web/src/hooks/useComparisonAspectData.js` | 5 | aspects + votes |
| `apps/web/src/pages/user-dashboard-page/activity.js` | 4 | activity |
| `apps/web/src/pages/product-details/tabs/CommentAppearancesTab.jsx` | 3 | items |

The rest is a long tail of 1–2-call files across `pages/` and `contexts/`.

**Rules going forward:**
- Any new feature work introduces zero new violations.
- When touching a file in the list above, prefer to migrate its calls in the same change rather than adding more inline ones.
- The `votes` family is the natural first cleanup pass — most direct calls are `POST/DELETE /api/votes` repeated across 5 hooks. Consolidating them into `apps/web/src/services/votes.js` is ~1 day of work.
- Acceptance criterion for "done": `grep -rn "apiClient\." apps/web/src/ --include='*.js' --include='*.jsx' | grep -v "apps/web/src/services/\|apps/web/src/lib/"` returns nothing.
