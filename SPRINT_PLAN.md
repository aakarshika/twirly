# Twirly — Sprint Plan

**Purpose:** A single execution roadmap that interleaves the backend refactor (`REFACTOR_PLAN.md`) and the UI redesign (`UI_REDESIGN_PLAN.md`) into shippable, conflict-minimizing slices. Agents working on Twirly **must** follow this plan in order and update `SPRINT_TRACKER.md` as they go.

> **Path-rename note (Sprint 16, 2026-05-14):** This document describes Sprints 1–15, which were executed against the original `root + server/` layout. The repo was subsequently restructured into a pnpm monorepo (`apps/web/`, `apps/api/`, `packages/shared/`, `native/`). References to `server/` and `src/` here are preserved as the historical record of those sprints; the current layout is documented in `CLAUDE.md` and `MONOREPO_MIGRATION.md`.

**Created:** 2026-05-14
**Owners:** Shivam (product), agents (implementation)

---

## 0. How to use this plan

1. Open `SPRINT_TRACKER.md` — it is the source of truth for *what is done* and *what is in progress*.
2. Work strictly in sprint order. Do not start sprint N+1 until sprint N's Definition of Done is ticked.
3. Each sprint is **independently shippable**. Ship to `main` and verify in production-equivalent before starting the next sprint.
4. If a sprint reveals scope creep, write it down in the sprint's **Carry-over** section in the tracker — never silently expand the current sprint.
5. Refs `REFACTOR_PLAN.md§X` / `UI_REDESIGN_PLAN.md§Y` point to the authoritative detail. The sprint plan only sequences and bridges them.

### 0.1 Sprint shape (every sprint)
Every sprint has the same shape so agents can pattern-match:

- **Goal** — one sentence; the user-visible outcome
- **Backend work** — files to create/edit + queries + routes
- **Frontend work** — service rewrites + UI redesign for the slice
- **Tests** — Vitest unit tests for new backend code (queries + controllers; happy path + 1 error case each)
- **Manual smoke checklist** — 3–6 bullets the human runs in a browser/simulator
- **Definition of Done (DoD)** — must all be true to mark the sprint complete
- **Risk / notes** — what could break; what to watch
- **Refs** — section pointers into the two source plans

### 0.2 Testing conventions ("just enough")
- **Backend:** Vitest unit tests live next to the file (`foo.queries.test.js`, `foo.controller.test.js`). Mock the `db` client at the module boundary. Each exported function gets a happy-path test + one error-path test. No real Postgres needed.
- **Frontend:** No component unit tests. Each sprint defines a Manual Smoke Checklist; the agent runs it and pastes the result in `SPRINT_TRACKER.md`.
- **E2E:** Out of scope for this plan. Add a Playwright pass later if needed.
- **Type check + lint:** `npm run lint` (frontend) and `npm run lint --workspace=server` (once server exists) must be clean before DoD.

### 0.3 Branching & shipping (revised 2026-05-14)
- **Single working branch (`backend-add`)** carries all sprint work as sequential commits. The original "one branch per sprint" rule was dropped to keep solo-dev overhead down; live tracking already happens in `SPRINT_TRACKER.md`.
- **One commit per sprint** (or per logical unit within a sprint). Commit subject: `Sprint NN: <goal>`. Commit body summarizes what landed.
- **PRs are batched** rather than per-sprint. When the user decides to open a PR, group the sprint commits and squash- or merge-into-main as a unit. Tags (`sprint-NN`) may be applied to the relevant commit at that time.
- The historical "Branch:" header in each sprint block of `SPRINT_TRACKER.md` is informational only.

### 0.4 Status conventions in the tracker
- `[ ]` not started
- `[~]` in progress
- `[x]` done
- `[!]` blocked (with one-line note)

---

## 1. Sprint roadmap (15 sprints)

| # | Sprint | Layer | Goal |
|---|---|---|---|
| 1 | Backend Foundation | BE | Server boots, Drizzle introspects, logging + errors in place |
| 2 | Auth Migration | BE+FE | Better Auth live; users can sign up / in / out end-to-end |
| 3 | UI Foundation | FE | 3-theme token system live; status bar + base CSS clean |
| 4 | Chrome Redesign | FE | Native-feeling top bar, bottom tabs, drawer, adaptive breakpoints |
| 5 | Trending / Home Feed | BE+FE | Real discover grid replaces auto-redirect; backend serves it |
| 6 | Read-only Utility Services | BE+FE | Karma, search, polls migrated; search UI refreshed |
| 7 | Compare / Votes | BE+FE | Votes API migrated; TikTokScroll restructured + safe-area-aware |
| 8 | Comments & Reactions | BE+FE | Comments API + redesigned comment surface |
| 9 | Reviews & Item Metrics | BE+FE | Reviews API + UI surface |
| 10 | Products & Categories | BE+FE | Product CRUD + category management |
| 11 | Comparisons CRUD (HIGH RISK) | BE+FE | Multi-table transactional create/update/delete |
| 12 | Users & Dashboard (HIGH RISK) | BE+FE | Profile + notification + category prefs + account deletion + dashboard redesign |
| 13 | Activity + Feedback + Uploads | BE+FE | Activity log API, feedback submission, storage abstraction |
| 14 | Cleanup & Hardening | BE | Supabase removed, validation everywhere, CORS, security headers |
| 15 | QA & Native Polish | FE+QA | Visual matrix, real-device tests, accessibility, Sentry |

---

## Sprint 1 — Backend Foundation

**Goal:** Express server boots on port 4000, returns `200 OK` from `/api/health`, can read from the existing Supabase Postgres via Drizzle.

**Backend work**
- Root-level dev tooling per `REFACTOR_PLAN.md§0.1`: add `concurrently`, root `npm run dev` runs frontend + backend.
- Create `server/` workspace per `REFACTOR_PLAN.md§5` (directory tree at line 602):
  - `server/package.json` — dependencies per `REFACTOR_PLAN.md§0.2`.
  - `src/config/env.js` — Zod-validated env loader (`REFACTOR_PLAN.md§1.1`).
  - `src/lib/logger.js` — Pino + `pino-pretty` in dev (`REFACTOR_PLAN.md§1.2`).
  - `src/config/db.js` — node-postgres `Pool` + Drizzle instance (`REFACTOR_PLAN.md§1.3`).
  - `src/app.js` — Express app with `cors`, `helmet`, `pino-http`, `express.json` (`REFACTOR_PLAN.md§1.4`).
  - `src/middleware/errorHandler.js` — `http-errors`-aware central handler (`REFACTOR_PLAN.md§1.5`).
  - `src/index.js` — boots `app.listen(env.PORT)` (`REFACTOR_PLAN.md§1.6`).
  - `src/features/health/` — single `GET /api/health` route returning `{ data: { ok: true } }`.
- `drizzle.config.js` + `npx drizzle-kit introspect` against existing DB → `server/src/db/schema/` (`REFACTOR_PLAN.md§2.1, §2.2`).
- Disable Supabase RLS on all 22 tables (`REFACTOR_PLAN.md§0.5`). **Risk:** verify a DB snapshot exists first.
- `server/scripts/setup-db.sh` placeholder per `REFACTOR_PLAN.md§0.0`.

**Frontend work**
- None this sprint. Frontend continues to use Supabase as-is.

**Tests**
- Vitest set up in `server/`.
- Unit test `src/features/health/health.controller.test.js` — happy path returns `{ data: { ok: true } }`.
- Unit test `src/middleware/errorHandler.test.js` — given an `http-errors` error, responds with correct status + shape.

**Manual smoke checklist**
- [ ] `npm run dev` (root) starts both frontend (port 3000) and backend (port 4000).
- [ ] `curl http://localhost:4000/api/health` returns `{"data":{"ok":true}}`.
- [ ] `psql $DATABASE_URL -c "SELECT 1"` succeeds from the dev machine.
- [ ] `npx drizzle-kit introspect` produces non-empty schema files matching the 22 known tables.
- [ ] Supabase dashboard shows RLS disabled on all tables.

**DoD**
- All smoke items checked.
- `server/` has no errors on `npm run build` (if a build step is added) and `npm run lint`.
- Tracker updated, sprint tagged.

**Risk / notes**
- Disabling RLS is the only externally-visible change; the frontend still authenticates with Supabase so this is safe as long as nothing else is using direct anon-key reads of restricted tables.
- Keep a DB snapshot from before this sprint.

**Refs:** `REFACTOR_PLAN.md` Sections 0, 1, 2.

---

## Sprint 2 — Auth Migration (Better Auth)

**Goal:** Users sign up, sign in (email + Google), and sign out via Better Auth. The existing user base survives via an ID-mapping migration. Frontend uses `authClient` from Better Auth SDK; Supabase Auth calls removed.

**Backend work**
- `src/config/auth.js` — Better Auth instance with Drizzle adapter, email/password + Google provider (`REFACTOR_PLAN.md§8.2`).
- Better Auth migrations create the 4 new tables: `user`, `session`, `account`, `verification` (`REFACTOR_PLAN.md§4.7`).
- One-time **ID-mapping migration script** (`server/scripts/migrate-users.sql` or `.js`) per `REFACTOR_PLAN.md§4.8` + Risk Register row 1:
  - Map old `auth.users.id` → new `user.id` by email.
  - Update every FK column in the 22 existing tables.
  - Wrap in a transaction. Run on a DB snapshot first; commit only after verification.
- `src/features/auth/auth.routes.js` — mounts Better Auth's Express handler at `/api/auth/*` (`REFACTOR_PLAN.md§8.3`).
- `src/middleware/requireAuth.js` — reads session cookie, attaches `req.user` (`REFACTOR_PLAN.md§8.4`).
- `src/middleware/requireOwner.js` — generic owner check (`REFACTOR_PLAN.md§8.5`).
- `express-rate-limit` on `/api/auth/sign-in/*` and `/api/auth/forget-password` per `REFACTOR_PLAN.md§8.9`.

**Frontend work**
- `src/lib/apiClient.js` — Axios with `withCredentials: true`, base URL `/api` (`REFACTOR_PLAN.md§11.1`).
- `src/lib/authClient.js` — Better Auth React client (`REFACTOR_PLAN.md§11.2`).
- Rewrite `src/services/authService.js` to call `authClient.*` instead of `supabase.auth.*` (`REFACTOR_PLAN.md§8.8`).
- Update `src/contexts/AuthContext.jsx` + `src/hooks/useAuthHook.js` to consume `authClient.getSession()` (`REFACTOR_PLAN.md§11.6`). Verify every field consumed by these matches the new session shape — patch consumers where it differs.
- `vite.config.js` proxy block (`REFACTOR_PLAN.md§12.1`).

**Tests**
- Unit test `requireAuth` middleware: no session → 401, valid session → `req.user` populated, `next()` called.
- Unit test `requireOwner`: not-owner → 403, owner → `next()`.
- Manual: full sign-up + sign-in + Google + sign-out flow.

**Manual smoke checklist**
- [ ] Sign up with email + password — new row in `user` table.
- [ ] Sign in — session cookie set; refresh keeps user logged in.
- [ ] Sign in with Google — account row created, linked to user.
- [ ] Sign out — cookie cleared, redirect to landing.
- [ ] Forgot password — reset email arrives via Resend.
- [ ] Rate-limit: 6 bad logins in a row → 429.
- [ ] Existing Supabase user (use a known email) can sign in and their old `user_preferences`, comparisons, votes still resolve correctly.

**DoD**
- All smoke items.
- Mapping migration committed and re-runnable (idempotent) or clearly marked one-shot.
- `npm uninstall @supabase/supabase-js` is **not** done yet — Supabase Storage still in use; defer to Sprint 14.

**Risk / notes**
- **Highest-risk sprint.** Take a DB snapshot before running the ID migration.
- If a user's email doesn't match between Supabase and any Google account they used, their content may orphan. Have a manual reconcile step ready.
- Keep Supabase Auth's Google config alive until this ships — rollback path.

**Refs:** `REFACTOR_PLAN.md` Sections 4.7, 4.8, 8, 11.1, 11.2, 11.6, 12.1; Risk Register rows 1 & 3.

---

## Sprint 3 — UI Foundation

**Goal:** A single semantic-token color system powers the whole app. Three themes (Light, Dark, Ocean) with `prefers-color-scheme` default. Status bar icons flip with theme. All duplicate CSS removed.

**Backend work**
- None.

**Frontend work**
- `tailwind.config.js` — rewrite `theme.extend.colors` to semantic tokens: `bg, surface, surface-elevated, text, text-muted, text-inverse, border, border-strong, primary, primary-fg, success, warning, danger, overlay` (`UI_REDESIGN_PLAN.md§4`).
- `src/contexts/ThemeContext.jsx` — reduce 8 themes to 3 (Light, Dark, Ocean); detect `window.matchMedia('(prefers-color-scheme: dark)')` as default; emit new token names as CSS custom properties on `:root`.
- `src/styles/globals.css` — rewrite base styles against tokens.
- **Delete** `src/styles/global.css` (duplicate light defaults).
- **Delete** `src/index.css`'s `--background-color: red` placeholder.
- `src/App.jsx` — replace hardcoded `Style.Light` with a value derived from the active theme; subscribe to theme changes.
- Sweep `src/components/layout/Header.jsx` and `Footer.jsx` to remove `bg-gray-100` and other hex/Tailwind-gray literals from shared chrome **only** — leave individual pages for their own sprints (they migrate when touched).

**Tests**
- No backend tests.
- Add a tiny `ThemeContext.test.jsx` (Vitest + RTL) that asserts the provider emits all expected CSS variables for each theme.

**Manual smoke checklist**
- [ ] Toggle system dark mode on macOS / iOS — Twirly follows.
- [ ] Settings drawer theme switcher shows 3 options; switching updates every surface live.
- [ ] iOS simulator across all 3 themes: status bar icons are visible.
- [ ] DevTools color picker on `body` background returns the correct token value for each theme.
- [ ] No `bg-gray-*` or hex literals remain in `Header.jsx` or `Footer.jsx`.
- [ ] Lighthouse contrast audit passes on a Trending page (even with stub layout) and a Compare page.

**DoD**
- All smoke items.
- `git grep "var(--color-"` returns no matches in `src/components/layout/*` (we'll let other pages migrate during their own sprints).
- Tracker updated.

**Risk / notes**
- Individual pages (compare, dashboard, etc.) still use the old token names. They will be migrated in their own sprints. That's intentional — limits this sprint's blast radius.

**Refs:** `UI_REDESIGN_PLAN.md` Sections 4, 5 Phase 0.

---

## Sprint 4 — Chrome Redesign

**Goal:** Top bar, bottom tabs, side nav, drawer all feel native and theme-aware. Adaptive breakpoints kick in. Android hardware-back wired to drawer/modals.

**Backend work**
- None.

**Frontend work**
- Split `src/components/layout/Header.jsx` into `TopBar.jsx`, `BottomTabs.jsx`, `SideNav.jsx`, `MobileDrawer.jsx` (`UI_REDESIGN_PLAN.md§5 Phase 1`).
- Bottom tab bar: 5 items, 56px + safe-area-bottom padding, theme-aware active indicator.
- Top bar: contextual title + back button + page actions.
- Mobile drawer: token-driven; wire `@capacitor/app` `backButton` listener to close drawer before navigating.
- Tablet (768–1023): main content centered ~480px column; mobile chrome retained.
- Desktop (≥1024): collapsible side panel + top header with logo/search/CTA; no bottom tab bar.
- Decide on the commented-out swipe-back gesture at `MainRoutingPage.jsx:129` — keep with proper polish or delete the comment. Document the call in the PR.

**Open question to resolve before starting:** which 5 items go in the bottom tab bar (currently 4: Home / Search / Create / Profile + ?). Default to **Home / Search / Create / Notifications / Profile**. If the user pushes back, adjust.

**Tests**
- No backend tests.
- Lightweight render test for each new layout component (no logic, just "renders without crashing").

**Manual smoke checklist**
- [ ] Every tappable chrome element ≥ 44 × 44 px (use device toolbar measurement).
- [ ] Android: open drawer → press hardware back → drawer closes, does not exit app.
- [ ] iPhone with home indicator: bottom tab bar sits above it; tab bar visible.
- [ ] Resize browser through 767→768→1023→1024 — layout snaps correctly at each breakpoint.
- [ ] No layout shift when switching theme.
- [ ] Each tab navigates to the correct route; active tab indicator updates.

**DoD**
- Smoke complete; PR captures the bottom-tab-item decision.

**Risk / notes**
- This is the riskiest pure-UI sprint because it touches every page. Validate by clicking through *every* existing route before merging.

**Refs:** `UI_REDESIGN_PLAN.md` Section 5 Phase 1.

---

## Sprint 5 — Trending / Home Feed

**Goal:** A real discover-grid home screen replaces the auto-redirect stub. Tapping a card opens the swipe scroller at that comparison. Backend serves the home feed.

**Backend work**
- `src/features/trending/` — `trending.queries.js`, `trending.controller.js`, `trending.routes.js` (`REFACTOR_PLAN.md§9.11`).
  - `GET /api/trending?userId=` → wraps `fetch_popular_aspect_sets_for_user($1)`.
  - `GET /api/sets?userId=&filter=&categoryId=&limit=` → wraps `get_filtered_sets(...)`.
- Mount in `src/app.js`.

**Frontend work**
- Rewrite `src/contexts/TrendingContext.jsx` to call `apiClient.get('/api/trending')` and `apiClient.get('/api/sets')` instead of `supabase.rpc(...)` (`REFACTOR_PLAN.md§11.5`).
- Rebuild `src/pages/trending-page/Trending.jsx` (`UI_REDESIGN_PLAN.md§5 Phase 2`):
  - Kill the auto-redirect.
  - Horizontal-scrolling category filter chips at top.
  - Vertical grid of comparison preview cards.
  - Pull-to-refresh.
  - Empty / loading / error states. Empty state has a clear "Create a comparison" CTA.
  - Card tap → `navigate('/compare/:id')`.
- Redesign `TrendingCard.jsx` + `TrendingCardCommon.jsx`: A vs B media/labels, vote counts, creator avatar/name, category — token-driven.

**Tests**
- Vitest unit: `trending.queries.test.js` (mock db) — both functions: happy + error.
- Vitest unit: `trending.controller.test.js` — happy + error.

**Manual smoke checklist**
- [ ] Open app as a logged-in user → land on Trending grid, **not** the scroller.
- [ ] Filter chips switch the result set.
- [ ] Tap a card → swipe scroller opens at that comparison. Perceived latency < 300 ms.
- [ ] Pull-to-refresh works on iOS + Android simulator.
- [ ] Empty state shows when no results match the filter.
- [ ] No console errors; no Supabase RPC calls in the network tab for Trending.

**DoD**
- Smoke complete; first vertical slice migrated end-to-end.

**Risk / notes**
- The Postgres function signatures must not change; the controller just passes params through.

**Refs:** `REFACTOR_PLAN.md` §9.11, §11.5; `UI_REDESIGN_PLAN.md` Phase 2.

---

## Sprint 6 — Read-only Utility Services

**Goal:** Karma, search, polls all migrated to the new backend. Search UI gets a token refresh; the others have no UI work.

**Backend work**
- `src/features/karma/` (`REFACTOR_PLAN.md§9.1`):
  - `GET /api/karma?userId=` and `GET /api/karma?userIds[]=`.
- `src/features/search/` (`REFACTOR_PLAN.md§9.2`):
  - `GET /api/search?q=&type=sets|items|users&limit=`.
- `src/features/polls/` (`REFACTOR_PLAN.md§9.3`):
  - `GET /api/polls?userId=` (auth required).

**Frontend work**
- Rewrite `src/services/karmaService.js`, `searchService.js`, `polls.js` using the apiClient pattern (`REFACTOR_PLAN.md§11.4`).
- Search results UI: migrate any page that consumes `searchService` to the new tokens. Visual redesign of search is deferred per `UI_REDESIGN_PLAN.md§6`.

**Tests**
- Vitest unit: one happy + one error per `queries.js` function and per `controller.js`.

**Manual smoke checklist**
- [ ] Karma badge renders on a profile page; matches `karma_points` row.
- [ ] Global search: type "test" → sets / items / users results return.
- [ ] Polls page renders the same user's polls as before the migration.
- [ ] No supabase calls in network tab for these surfaces.

**DoD** — all smoke checked.

**Refs:** `REFACTOR_PLAN.md` §9.1–§9.3, §11.4.

---

## Sprint 7 — Compare / Votes

**Goal:** Votes API migrated. TikTokScroll is restructured into smaller components. Voting feels confident: thumb-zone affordances, theme-aware, safe-area aware.

**Backend work**
- `src/features/votes/` (`REFACTOR_PLAN.md§9.6`):
  - `GET /api/votes?userId=` (auth)
  - `GET /api/votes/check?userId=&setId=`
  - `GET /api/votes/count?setId=&itemId=`
  - `POST /api/votes` (auth)
  - `PUT /api/votes/:id` (auth, owner)
  - `DELETE /api/votes/:id` (auth, owner)
- Zod schemas for `POST` / `PUT` bodies.

**Frontend work**
- Rewrite `src/services/votes.js` + `src/services/voting.js`.
- Split `src/components/TikTokScroll.jsx` into `ScrollContainer` + `ComparisonCard` (`UI_REDESIGN_PLAN.md§5 Phase 3`).
- Card structure: creator strip → media → A/B vote affordances → results bar → comments toggle.
- Vote bar sits above iOS home indicator (safe-area-bottom).
- Theme-aware overlay gradient at top.
- Token migration for `src/pages/compare-page/Grid.jsx`, `Heading.jsx`, `CompareButtons.jsx`, and the `comparison-results-page/*` files (`ComparisonCirclesView`, `ComparisonCircle`, `CenterStage`).

**Tests**
- Vitest unit: votes queries + controller (each route).
- Specifically test the existence-check path in `castVote` controller.

**Manual smoke checklist**
- [ ] Vote on a comparison → result bar animates in < 500 ms.
- [ ] Re-vote (change choice) → counts update correctly.
- [ ] Revert vote → counts decrement; vote-button state resets.
- [ ] Swipe through 10 comparisons on iPhone 12-class device — 60 fps perceived.
- [ ] Vote bar visible above home indicator on iPhone 15.
- [ ] All 3 themes render the compare card correctly.

**DoD** — smoke complete; no fps regressions visible in the React Profiler.

**Risk / notes**
- This is the highest-visibility frontend sprint. Spend extra time on the animation polish.

**Refs:** `REFACTOR_PLAN.md` §9.6; `UI_REDESIGN_PLAN.md` Phase 3.

---

## Sprint 8 — Comments & Reactions

**Goal:** Comment thread on each comparison is paginated, reactable, replyable. UI handle is accessible and safe-area aware.

**Backend work**
- `src/features/comments/` (`REFACTOR_PLAN.md§9.8`):
  - `GET /api/comparisons/:setId/comments?page=&pageSize=`
  - `POST /api/comparisons/:setId/comments` (auth)
  - `POST /api/comments/:id/replies` (auth)
  - `POST /api/comments/:id/react` (auth)
  - `DELETE /api/comments/:id/react` (auth)
  - `GET /api/users/:userId/comments?page=&pageSize=`
- Pagination per `REFACTOR_PLAN.md§2.5`.

**Frontend work**
- Rewrite `src/services/comments.js` + `src/services/comparisonSetService.js`.
- Redesign `src/pages/compare-page/AllComments.jsx`: collapse/expand handle, safe-area aware, theme-aware.

**Tests**
- Vitest unit: comments queries + controller; specifically the toggle path in `reactToComment`.

**Manual smoke checklist**
- [ ] Open a comparison's comments → first page loads.
- [ ] Scroll to bottom → next page fetches.
- [ ] Post a comment → appears at top without reload.
- [ ] Reply to a comment → reply nests under it.
- [ ] React with thumbs-up → re-tap toggles it off.
- [ ] Comments don't get hidden behind the iOS home indicator.

**Refs:** `REFACTOR_PLAN.md` §9.8.

---

## Sprint 9 — Reviews & Item Metrics

**Goal:** Reviews API + UI surface. Like-toggle is transactional.

**Backend work**
- `src/features/reviews/` (`REFACTOR_PLAN.md§9.7`):
  - `GET /api/reviews?itemId=&page=&pageSize=`
  - `GET /api/reviews?userId=`
  - `POST /api/reviews` (auth)
  - `POST /api/reviews/:id/like` (auth)
  - `DELETE /api/reviews/:id/like` (auth)
  - `GET /api/items/:id/metrics`
- The like + counter increment must be a single transaction.

**Frontend work**
- Rewrite `src/services/reviews.js`.
- Token migration on the review-render surfaces.

**Tests**
- Vitest unit: reviews queries (incl. the like transaction with mocked tx) + controller.

**Manual smoke checklist**
- [ ] List reviews for an item — paginated correctly.
- [ ] Submit a review → appears at top.
- [ ] Like → counter increments by 1; unlike → decrements.
- [ ] Two rapid likes from same user → only one row in `review_likes`.

**Refs:** `REFACTOR_PLAN.md` §9.7.

---

## Sprint 10 — Products & Categories

**Goal:** Full CRUD for products and categories via the new backend. The create/edit-comparison flows that depend on products work end-to-end.

**Backend work**
- `src/features/products/` and `src/features/categories/` (`REFACTOR_PLAN.md§9.5`):
  - All product routes (GET/POST/PUT/DELETE) with `requireAuth` + `requireOwner` on mutations.
  - Categories: `GET /api/categories?q=`, `POST /api/categories` (auth).
- Wrap multi-row writes (create/update product + categories) in transactions.
- Zod schemas for all POST/PUT bodies.

**Frontend work**
- Rewrite `src/services/products.js`.
- Token migration on product-edit and category-picker surfaces.

**Tests**
- Vitest unit: products queries + controller, with extra coverage on the transaction in `createProduct` / `updateProduct`.

**Manual smoke checklist**
- [ ] Create a product → it appears in user's product list.
- [ ] Edit a product → changes persist, categories update.
- [ ] Delete a product → row gone; `item_categories` cascade verified.
- [ ] Search products by name.
- [ ] Non-owner can't edit/delete (returns 403).

**Refs:** `REFACTOR_PLAN.md` §9.5.

---

## Sprint 11 — Comparisons CRUD (HIGH RISK)

**Goal:** The comparison object — the app's core entity — has full transactional CRUD via the new backend. Dashboard's "Your Comparisons" tab works.

**Backend work**
- `src/features/comparisons/` (`REFACTOR_PLAN.md§9.9`):
  - All routes from `REFACTOR_PLAN.md§9.9`, incl. `unpublished`, items, aspects.
- `createComparison` and `updateComparison` are multi-table transactions: `comparison_sets` + `items` + `aspects`. **Test the rollback path** — partial failures must not leak rows.
- `requireOwner` on every PUT/DELETE.

**Frontend work**
- Rewrite `src/services/comparisons.js`.
- Token migration on every create-comparison / edit-comparison page.

**Tests**
- Vitest unit: each query function + the transactional create/update with a forced-failure case (e.g., mock the items insert to throw — assert the comparison row was rolled back).
- Controller tests for the success and ownership-fail paths.

**Manual smoke checklist**
- [ ] Create a new comparison (2+ items, 2+ aspects) → all rows persisted.
- [ ] Edit a comparison's items → old items removed, new items inserted.
- [ ] Upsert an aspect → existing aspect updates; new aspect inserts.
- [ ] Delete a comparison → cascade removes items + aspects + votes.
- [ ] Get my unpublished draft → returns it.

**Risk / notes**
- High risk because of multi-table transactions. Take a DB snapshot before testing destructive paths.

**Refs:** `REFACTOR_PLAN.md` §9.9.

---

## Sprint 12 — Users & Dashboard (HIGH RISK)

**Goal:** Profile, notification settings, category preferences, and account deletion all run on the new backend. Dashboard / profile redesign ships (UI Phase 4).

**Backend work**
- `src/features/users/` (`REFACTOR_PLAN.md§9.10`):
  - All `/api/users/*` routes incl. `me/notifications`, `me/category-preferences`, `check-username`.
  - `DELETE /api/users/me` is the highest-risk single endpoint — multi-table cascade in strict FK order, wrapped in a transaction.
- Username availability check.

**Frontend work**
- Rewrite `src/services/userService.js` + `src/services/users.js`.
- Dashboard / profile redesign per `UI_REDESIGN_PLAN.md§5 Phase 4`:
  - Profile header: avatar, display name, @username, member-since, follower/following counts.
  - Tabs: Your Comparisons / Your Votes / Followers (or existing model).
  - Empty state per tab with clear next-action CTA.
  - "Create Comparison" entry from dashboard.
- Files touched: `UserDashboard.jsx`, `UserProfile.jsx`, `dashboard/*`, `tabs/CreateComparison.jsx`.

**Tests**
- Vitest unit: users queries + controller, with **explicit coverage** on `deleteAccount` (mock each table delete; verify FK order; force one to throw → assert rollback).
- Controller tests for ownership-guarded routes.

**Manual smoke checklist**
- [ ] View own profile — all stats correct.
- [ ] Update username (available) → succeeds. Update to taken username → 409.
- [ ] Update notification settings → persisted.
- [ ] Update category preferences → persisted.
- [ ] Tab switching ≤ 150 ms.
- [ ] Empty states don't look like errors.
- [ ] Delete account: confirm dialog → all user data removed → signed out. Run on a test user, not your own.

**Risk / notes**
- Snapshot DB before testing `deleteAccount`. Run it on a throwaway test user.

**Refs:** `REFACTOR_PLAN.md` §9.10; `UI_REDESIGN_PLAN.md` Phase 4.

---

## Sprint 13 — Activity + Feedback + Uploads

**Goal:** Activity log, feedback submission, and the storage abstraction are live. File uploads no longer go through Supabase Storage.

**Backend work**
- `src/features/activity/` (`REFACTOR_PLAN.md§9.4`):
  - POST/GET/count routes, auth required.
- `src/features/feedback/` (`REFACTOR_PLAN.md§9.12`):
  - GET/POST/PUT/DELETE; admin-only on list/update/delete.
- `src/features/uploads/` (`REFACTOR_PLAN.md§10`):
  - `POST /api/uploads` (auth).
  - `src/config/storage.js` — driver-switched Multer (local for dev, S3 for prod), env-driven.

**Frontend work**
- Rewrite `src/services/userActivityService.js` and `src/services/feedbackService.js`.
- Replace direct Supabase Storage uploads with calls to `POST /api/uploads` per `REFACTOR_PLAN.md§10.3`.

**Tests**
- Vitest unit: activity, feedback queries + controllers.
- Storage driver smoke test: in test mode, `upload` returns the expected key shape.

**Manual smoke checklist**
- [ ] Activity logs created when user votes / comments / creates.
- [ ] Submit feedback with an image → row created, image URL valid.
- [ ] Admin can list / update status / delete feedback.
- [ ] Upload a profile pic → it appears on the profile page; file is in local upload dir (dev) or S3 (staging).
- [ ] Non-admin can't access admin feedback routes.

**Refs:** `REFACTOR_PLAN.md` §9.4, §9.12, §10.

---

## Sprint 14 — Cleanup & Hardening

**Goal:** Supabase fully removed. Every mutating route validated. Every owner-protected route guarded. Security headers + CORS correct for production.

**Backend work**
- `src/middleware/validate.js` per `REFACTOR_PLAN.md§13.2`; apply to every POST/PUT route.
- Sweep all feature routes — confirm `requireOwner` is applied where appropriate (`REFACTOR_PLAN.md§13.3`).
- `helmet` CSP review (`REFACTOR_PLAN.md§13.4`).
- Production CORS config (`REFACTOR_PLAN.md§13.6`).
- Production logging — raw JSON to log aggregator (`REFACTOR_PLAN.md§13.7`).
- Optional: serve `dist/` from Express in prod (`REFACTOR_PLAN.md§13.8`).
- `EXPLAIN ANALYZE` on the 5 hottest queries; add indices if any sequential scans on large tables (`REFACTOR_PLAN.md§13.5`).

**Frontend work**
- `npm uninstall @supabase/supabase-js` from root.
- Delete `src/lib/supabase.js`.
- Remove `VITE_SUPABASE_*` env vars from all `.env` files (`REFACTOR_PLAN.md§12.2`).
- Final sweep — `git grep "supabase"` must return zero matches outside historical files.

**Tests**
- Vitest unit: `validate` middleware (good body passes; bad body 400).
- Add 1 validation test per `validate`-guarded route as you wire it up.

**Manual smoke checklist**
- [ ] `git grep -i supabase src/` — no matches.
- [ ] Every mutating route rejects bad input with 400 + Zod error shape.
- [ ] CORS works from `https://twirlyapp.com` and is rejected from a random origin.
- [ ] CSP header doesn't break Tailwind / inline styles.
- [ ] Production build serves frontend correctly from Express.

**Refs:** `REFACTOR_PLAN.md` Section 14.

---

## Sprint 15 — QA & Native Polish

**Goal:** Ship-ready. Confidence across themes, form factors, and platforms.

**Tasks**
- **Visual QA matrix:** 3 themes × {phone, tablet, desktop} × {iOS, Android, web}. Track in `SPRINT_TRACKER.md`'s QA section.
- **Real-device tests:**
  - iPhone with notch + Dynamic Island
  - iPhone SE (small)
  - Pixel
  - one low-end Android
- **Contrast audit (WCAG AA)** across all major pages.
- **`prefers-reduced-motion`** respected in framer-motion transitions — wrap motion components.
- **Screen-reader sanity** on Trending, Compare, Dashboard (VoiceOver + TalkBack).
- **Sentry breadcrumbs** preserved through redesign — verify a forced error reports cleanly.

**DoD**
- Matrix fully ticked.
- Open a single tracking PR `Sprint 15: QA pass` listing any defects found during the matrix; either fix them in-sprint or open follow-up issues with clear severity.

**Refs:** `UI_REDESIGN_PLAN.md` Phase 5.

---

## 2. Cross-sprint conventions

### 2.1 Where files live
- Backend: `server/src/features/<feature>/{feature.queries.js, feature.controller.js, feature.routes.js, feature.schema.js}`.
- Tests next to the file as `*.test.js`.
- Frontend service file paths unchanged so consuming hooks don't move.

### 2.2 Response shape (always)
```json
{ "data": <payload> }
{ "error": { "message": "...", "code": "..." } }
```
Never return raw arrays at the top level; always nested under `data`.

### 2.3 Frontend service rewrite pattern
Per `REFACTOR_PLAN.md§11.4`: keep the exported function signatures of `src/services/*.js` identical. Only the body changes (supabase → apiClient). Consumers (hooks, contexts) are not touched in a service sprint.

### 2.4 What never goes in a feature sprint
- Theming changes for files **outside** the feature being migrated (those wait for their own sprint or Sprint 4 chrome work).
- Backend changes that aren't in the feature's `REFACTOR_PLAN.md§9.x` section.
- Logo / branding work.
- Onboarding flow redesign.

### 2.5 Open questions (resolve in-sprint when you reach them)
- **Sprint 4:** Which 5 bottom-tab items? Default = Home / Search / Create / Notifications / Profile.
- **Sprint 4:** Keep or delete commented-out swipe-back at `MainRoutingPage.jsx:129`?
- **Any sprint touching pages not yet redesigned:** Migrate inline to new tokens. Don't redesign visually unless the sprint owns that page.

---

## 3. Carry-overs and follow-ups

Anything that arises mid-sprint and doesn't belong in the current scope gets appended to the **Carry-over** list inside `SPRINT_TRACKER.md` for its sprint. At the end of the plan, an agent reviews the full carry-over list and decides whether each item warrants a new sprint, an in-sprint follow-up to QA (Sprint 15), or `won't-do`.
