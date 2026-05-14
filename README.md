# Twirly

**Pick a side. Make your case. See what everyone else thinks.**

Twirly is a comparison platform where users create head-to-head matchups between anything — products, ideas, opinions, places — and let the crowd decide. Less about being right, more about what people actually think.

Live at [twirlyapp.com](https://twirlyapp.com)

---

## What it does

- **Create comparisons** — set up any A vs B matchup with context, images, and a framing argument
- **Vote and comment** — weigh in on comparisons, see live results, read what others think
- **User profiles and dashboards** — track comparisons you've created, voted on, or followed
- **Feedback system** — flag bad comparisons, suggest improvements
- **Multi-theme support** — 8 themes including Dark, Neon, Retro, Ocean — each with a complete, consistent token set
- **Mobile-ready** — ships as a web app and as native iOS/Android via Capacitor

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, React Router 7 |
| Backend  | Node.js + Express 5 (ESM), Drizzle ORM |
| Database | PostgreSQL 16 |
| Auth     | Better Auth (email/password + Google OAuth) |
| Mobile   | Capacitor (iOS + Android) |

The repo is split into two workspaces: the Vite React app at the root, and the Express API in `server/`. They run side-by-side in dev via `concurrently`.

---

## Architecture

    /
    ├── src/                 # React frontend
    │   ├── components/      # Reusable UI — themed, responsive
    │   ├── contexts/        # Auth, Theme, Header, Feedback, Loading, …
    │   ├── hooks/           # Custom hooks
    │   ├── pages/           # Route-level components
    │   ├── services/        # API wrappers (per domain) — components never call apiClient directly
    │   ├── lib/             # apiClient (axios), authClient (Better Auth), helpers
    │   └── utils/           # Shared utilities
    │
    └── server/              # Express API
        └── src/
            ├── app.js       # Router mount point — read this first
            ├── features/    # Feature folders: routes / controller / queries / schema / tests
            ├── middleware/  # requireAuth, requireOwner, requireAdmin, optionalAuth, validate
            ├── db/          # Drizzle schema + migrations (auto-run on boot)
            └── config/      # env (Zod-validated), auth, db, storage

**Theming** — all colors are driven by a theme token system via `ThemeContext`. Components never hardcode colors. Adding a new theme is one token object; no component changes.

**Auth** — Better Auth on the server (Drizzle adapter, session cookies). Frontend reads session via `AuthContext`. All requests use `apiClient` (axios with `withCredentials: true`); Vite proxies `/api/*` to `localhost:8734` in dev.

**Error contract** — server always responds with `{ error: { message, code } }`; the `apiClient` interceptor surfaces those on the thrown error. Preserved on both sides.

---

## Local Setup

```bash
# Install dependencies (root and server)
npm install
npm --prefix server install

# Local Postgres
docker compose up -d

# Environment
cp server/.env.example server/.env
# Set DATABASE_URL, BETTER_AUTH_SECRET (32+ chars), BETTER_AUTH_URL

# Start everything (Postgres :7432, vite :5734, server :8734) — kills existing ports first
make dev
```

Migrations run automatically on server boot. To generate a new one after editing `server/src/db/schema/`:

```bash
npm --prefix server run db:generate
npm --prefix server run db:studio   # optional GUI
```

---

## Building & shipping

```bash
npm run web:build:prod    # production web build → dist/
npm run ios:prod          # web build → cap sync ios → open Xcode
npm run android:prod      # web build → cap sync android → open Android Studio
```

Build modes (`dev` / `stage` / `prod`) are Vite modes loaded by `loadEnv` and drive `VITE_*` env selection.

---

## Design decisions worth noting

**Self-hosted backend.** Originally on Supabase; migrated to a self-hosted Express + Drizzle + Better Auth stack over the Sprint 1–15 effort tracked in `SPRINT_TRACKER.md`. The migration removed the parallel-Supabase path entirely — there is no fallback.

**Feature-folder backend.** Each `server/src/features/<name>/` is self-contained: `routes.js` is mounted in `app.js`; `controller.js` handles requests; `queries.js` is the only layer touching the DB. Tests live next to the code they cover.

**Theme system as first-class feature.** Every UI component reads tokens from `ThemeContext`. Adding a new theme means adding one token object — no component changes needed.

**Capacitor for mobile.** Same React codebase ships to web, iOS, and Android. Safe-area insets and touch interactions are handled at the component level.

---

## Status

Live and deployed at [twirlyapp.com](https://twirlyapp.com). Progress is tracked in `SPRINT_TRACKER.md`; planning docs are `SPRINT_PLAN.md`, `REFACTOR_PLAN.md` (backend), and `UI_REDESIGN_PLAN.md` (frontend).
