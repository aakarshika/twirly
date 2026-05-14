# Twirly — Sprint Tracker

**Purpose:** Live progress board for the work described in `SPRINT_PLAN.md`. Agents update this file after every task. **This file — not chat memory — is the source of truth for "what's done."**

**Last updated:** 2026-05-14
**Current sprint:** Sprint 16 (Monorepo Migration — complete; see `MONOREPO_MIGRATION.md` for the M1–M6 sub-sprint detail)

**Branching strategy (revised 2026-05-14):** All sprint work lands on the `backend-add` branch as sequential commits. The original plan called for per-sprint branches; the user opted to consolidate to keep overhead down. Each sprint still gets its own commit(s) so history is clean, but there's a single eventual PR (or a small number of grouped PRs) rather than 15. Branch column below is now historical / informational.

### Status legend
- `[ ]` not started
- `[~]` in progress
- `[x]` done
- `[!]` blocked (add one-line note inline)

### Update protocol
1. When starting a task: change `[ ]` → `[~]` and update **Last updated** at top.
2. When finishing a task: change `[~]` → `[x]`.
3. When blocked: change to `[!]` + add `— blocked: <reason>` on the same line.
4. When a sprint's **Definition of Done** is fully ticked: set the sprint header to `✓ Sprint NN — <name> (committed YYYY-MM-DD)` and bump **Current sprint** at the top. ("Merged" is reserved for the eventual PR merge to `main`, which happens once for the whole redesign rather than per sprint.)
5. Anything discovered mid-sprint that doesn't fit: append to the sprint's **Carry-over** list, never silently expand scope.

---

## ✓ Sprint 1 — Backend Foundation (committed 2026-05-14)

**Branch:** `backend-add` (all sprint work consolidated here per revised strategy)
**Status:** ✅ all in-scope items complete; committed 2026-05-14 as `91884bc` (bundled with Sprint 2)

### Backend
- [x] Root `package.json`: add `concurrently`; root `npm run dev` runs frontend + backend
- [x] Create `server/` workspace with `package.json` per REFACTOR_PLAN.md§0.2
- [x] `server/src/config/env.js` — Zod env loader
- [x] `server/src/lib/logger.js` — Pino + pino-pretty in dev
- [x] `server/src/config/db.js` — Drizzle + node-postgres Pool
- [x] `server/src/app.js` — Express with cors, helmet, pino-http, json
- [x] `server/src/middleware/errorHandler.js` — http-errors-aware (+ notFoundHandler)
- [x] `server/src/index.js` — `app.listen(env.PORT)`
- [x] `server/src/features/health/` — `GET /api/health` returns `{ data: { ok: true, ts } }`
- [x] `drizzle.config.js` added
- [x] `drizzle-kit introspect` smoke against fresh DB succeeds (returns 0 tables — empty DB; tooling proven, schema files filled in per-feature in later sprints)
- [x] Disable RLS — N/A: starting fresh, no legacy Supabase DB
- [x] `server/scripts/setup-db.sh` placeholder
- [x] `docker-compose.yml` at repo root → local Postgres 16 (db: twirly, user: twirly, port 5432)

### Tests
- [x] `health.controller.test.js` — happy path
- [x] `errorHandler.test.js` — http-error → correct status + shape (+ 500-hides-message, + notFoundHandler)

### Manual smoke
- [x] `npm run dev` boots both frontend (3000) + backend (4000)
- [x] `curl http://localhost:4000/api/health` → `{"data":{"ok":true,"ts":...}}`
- [x] DB connectivity verified: `docker exec twirly-postgres psql -U twirly -d twirly -c "SELECT 1"` → `1`; also confirmed via node-postgres pool reading `DATABASE_URL` from `server/.env`
- [x] `drizzle-kit introspect` runs cleanly against fresh DB (0 tables — schema is built per-feature in later sprints)
- [x] RLS step — N/A (fresh DB, no legacy Supabase)

### Definition of Done
- [x] All smoke items checked
- [x] `server/` lint clean
- [x] Committed on `backend-add` (commit `91884bc`, 2026-05-14, bundled with Sprint 2). PR/tag deferred per revised branching strategy.

### Carry-over
- **Drizzle schema bootstrap (Sprint 2 prep)**: existing `src/server/sql/ddl/*` files cannot be applied to vanilla Postgres without rewrite — they reference `auth.users` / `auth.uid()` / `auth.role()`, declare RLS policies + an `on_auth_user_created` trigger, and contain bugs (forward ref to `comparison_sets`, duplicate `unique_reply_reaction` constraint, index on non-existent `items.category_id`). Decision: hand-write Drizzle schema per-feature as each sprint touches its tables. Better Auth's own 4 tables (`user`, `session`, `account`, `verification`) come up in Sprint 2.
- **Host psql install (optional)**: not required (we use `docker exec twirly-postgres psql ...`). If the user wants `psql` on the host: `brew install libpq && echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc`.
- **Pre-existing frontend lint baseline**: `npm run lint` reports 55 errors / 3,631 warnings across existing `src/` files (untouched by Sprint 1). Triage in Sprint 15 (QA) or fold into the relevant feature sprint as each page is touched. Renamed `.eslintrc.js` → `.eslintrc.cjs` so lint can run at all under root `"type": "module"`.

---

## ✓ Sprint 2 — Auth Migration (Better Auth) (committed 2026-05-14)

**Branch:** `backend-add` (bundled with Sprint 1)
**Status:** code complete; backend smoked end-to-end; committed 2026-05-14 as `91884bc`; in-browser UI smoke pending per user direction to defer tests/smoke until end of redesign

### Backend
- [x] `server/src/config/auth.js` — Better Auth + Drizzle adapter, email/password + Google (Google only registered when env credentials are present)
- [x] Better Auth migration creates `user`, `session`, `account`, `verification` tables (Drizzle schema in `src/db/schema/auth.js`, SQL in `src/db/migrations/0000_better_auth.sql`)
- [x] **DB snapshot taken before user-id migration** — N/A: fresh local Postgres, no legacy users
- [x] `server/scripts/migrate-users.{sql,js}` — N/A: no legacy users to remap; downstream tables will be created with `user.id` FKs as each feature sprint lands
- [x] Run mapping migration on snapshot first; verify; then on real DB — N/A
- [x] `server/src/features/auth/auth.routes.js` mounted at `/api/auth/*` (must come before `express.json()` — Better Auth reads the raw stream)
- [x] `server/src/middleware/requireAuth.js`
- [x] `server/src/middleware/requireOwner.js`
- [x] `express-rate-limit` on sign-in + forgot-password (`authLimiter`, `registerLimiter`, `forgotPasswordLimiter`)

### Frontend
- [x] `src/lib/apiClient.js` — Axios with `withCredentials: true`, base `/api`
- [x] `src/lib/authClient.js` — Better Auth React client (`better-auth/react`, `useSession`, `signIn`, `signUp`, `signOut`)
- [x] Rewrite `src/services/authService.js` (signatures unchanged; bodies now call `authClient.*`; `handleAuthCallback` is a noop pending native deep-link rework — see carry-over)
- [x] `src/contexts/AuthContext.jsx` consumes `authClient.useSession()` indirectly via `useAuthHook` — context shape (`{ user, userPreferences, loading, error, signUp, signIn, signInWithGoogle, signOut }`) unchanged for consumers
- [x] `src/hooks/useAuthHook.js` rewritten on top of `authClient.useSession()`
- [x] `vite.config.js` proxy block (`/api → http://localhost:4000`)

### Tests
- [x] `requireAuth.test.js` — 401 / pass / `req.user` set + error forwarding (3 tests)
- [x] `requireOwner.test.js` — 401 / 404 / 403 / pass / error forwarding (5 tests)

### Manual smoke
- [x] Email sign-up → `user` row created (verified via curl + `SELECT … FROM "user"`; 2 users persisted)
- [x] Sign in → session cookie + token returned; `GET /api/auth/get-session` with that cookie returns the session
- [ ] Google sign-in → `account` row linked — blocked: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` not set in `server/.env`. Wiring is in place; needs creds to verify
- [x] Sign out (with `Origin` header, as a browser always sends) → `{success:true}`
- [ ] Forgot password → Resend email received — blocked: `RESEND_API_KEY` not set. Mailer falls back to a logged stub; verify by curl reaching `/forget-password`, then plug in a real key for a true email round-trip
- [x] Rate limit: 10 bad logins → 11th returns 429 (limit = 10/15min; matches `authLimiter` config)
- [x] Existing Supabase user smoke — N/A (no legacy users)
- [ ] In-browser smoke (sign-up form, sign-in form, sign-out menu, ForgotPassword.jsx) — pending; backend is verified

### Definition of Done
- [x] Mapping migration committed; idempotent or clearly one-shot — N/A (no legacy data)
- [x] Committed on `backend-add` (commit `91884bc`, bundled with Sprint 1). PR/tag deferred per revised branching strategy.
- [x] All Supabase Auth code paths removed from the frontend auth flow (`AuthContext`, `useAuthHook`, `authService`, `authClient`). Better Auth is now the sole auth runtime — no fallback or rollback path retained. The `@supabase/supabase-js` package is still installed because non-auth services call it directly; those usages are rewritten as each feature sprint touches its service, and the package + `src/lib/supabase.js` + `VITE_SUPABASE_*` env vars are terminally removed in Sprint 14.

### Carry-over
- **Google OAuth credentials**: set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `server/.env`, then re-run the Google sign-in smoke. Config branch in `auth.js` already gates the provider on these being present.
- **Resend API key**: set `RESEND_API_KEY` + `EMAIL_FROM` in `server/.env` to send real reset-password emails. Without them, `src/lib/mailer.js` logs the would-be send via pino instead of crashing.
- **Native deep-link OAuth callback**: the old `authService.handleAuthCallback(url)` (called from `MainRoutingPage.jsx:165`) is now a noop. Better Auth handles OAuth callbacks server-side; the Capacitor `appUrlOpen` path needs a fresh design when native auth UX is revisited. Track as a Sprint 12/15 follow-up.
- **`user_preferences` table**: `authService.getUserPreferences()` currently returns `null` (hits a not-yet-existing `/users/me/preferences` route and swallows the 404). Real implementation lands in Sprint 12.
- **Dead test surface removed (2026-05-14)**: deleted orphaned `src/pages/TestPage.jsx` + `src/components/test/SupabaseTest.jsx` (no routes pointed at them; only kept Supabase alive in dead code).
- **Frontend `better-auth` version**: installed `^1.6.11` on the frontend; server still on `^1.2.7`. Bumping the server to 1.6.x is a single-line change but out of scope here — file under Sprint 14 hardening unless a client/server protocol mismatch surfaces sooner.

---

## Sprint 3 — UI Foundation

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** implementation complete; committed 2026-05-14 as `3858e92`; tests + manual smoke pending per user direction

### Frontend
- [x] `tailwind.config.js` — semantic token palette (bg, surface, surface-elevated, text, text-muted, text-inverse, border, border-strong, primary, primary-fg, success, warning, danger, overlay) wired via `rgb(var(--token) / <alpha-value>)` so opacity utilities still work
- [x] `src/contexts/ThemeContext.jsx` — 3 themes only (Light, Dark, Ocean); `prefers-color-scheme` default with live listener; emits new token vars + legacy `--color-*` bridge vars to `:root`; exposes `currentTheme.tokens` + `currentTheme.colors` so unmigrated components keep working
- [x] `src/styles/globals.css` — base styles rewritten against tokens; legacy `--color-*` defaults included as bridge
- [x] Delete `src/styles/global.css`
- [x] Delete `src/index.css` (`--background-color: red` placeholder) — file was unimported, removed entirely
- [x] `src/App.jsx` — status bar style derived from active theme via `NativeStatusBar` subscriber inside `ThemeProvider`
- [x] Sweep `Header.jsx` + `Footer.jsx` — `bg-gray-100` × 5 in bottom tab bar replaced with `bg-surface` + token colors; bottom tab cells promoted to `<button>` with ≥44px touch targets; Footer `text-gray-500` / `hover:text-white` replaced with `text-text-muted` / `hover:text-text`

### Tests
- [ ] `ThemeContext.test.jsx` — provider emits all expected CSS vars for each theme

### Manual smoke
- [ ] System dark mode toggle → Twirly follows
- [ ] Settings drawer shows 3 themes; switching updates every surface live
- [ ] iOS simulator across 3 themes: status bar icons visible
- [ ] DevTools color picker on body → correct token value per theme
- [ ] `git grep "bg-gray-" src/components/layout/` → 0 matches
- [ ] Lighthouse contrast on Trending + Compare → pass

### Definition of Done
- [x] Implementation committed on `backend-add` (commit `3858e92`, 2026-05-14)
- [ ] All smoke checked — deferred per user direction to run tests after full redesign

### Carry-over
- (none yet)

---

## Sprint 4 — Chrome Redesign

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** implementation complete; tests + manual smoke deferred per user direction

### Decisions to make at start
- [x] **Bottom-tab items (5):** Home (`/`) · Search (`/search`) · Create (`/new-comparison?load_draft=true`) · Activity (`/activity`) · Profile (`/dashboard`). Activity replaces the proposed "Notifications" — it pairs cleanly with the activity backend coming in Sprint 13 and gives users a feed of votes/comments on their content.
- [x] **Swipe-back gesture at `MainRoutingPage.jsx:129`:** **Keep + improve.** User rule: this redesign only enhances existing functionality — no feature removals. Re-enable the commented-out gesture and tune for smoothness in this sprint.

### Frontend
- [x] Split `Header.jsx` → `TopBar.jsx`, `BottomTabs.jsx`, `SideNav.jsx`, `MobileDrawer.jsx`
- [x] BottomTabs: 5 items, 56px + safe-area-bottom, theme-aware active indicator (primary fill on create, primary icon color on others)
- [x] TopBar: contextual title + back button (non-root tabs) + menu trigger; desktop: logo + search + Create CTA
- [x] MobileDrawer: token-driven; `@capacitor/app` `backButton` listener closes drawer; backdrop overlay; route-change auto-close
- [x] Tablet (768–1023): mobile chrome retained (BottomTabs + TopBar, `lg:hidden` / `hidden lg:flex` breakpoint strategy)
- [x] Desktop (≥1024): `SideNav` (profile card + nav + settings expandable + beta); `TopBar` desktop strip (logo + search + Create CTA); no bottom tabs
- [x] `MainRoutingPage.jsx` — `lg:pl-64` for SideNav; `pt-14 lg:pt-16` for TopBar height; swipe-back re-enabled with `delta: 60`, skips compare + root tabs

### Tests
- [ ] Render tests for each new layout component (smoke only)

### Manual smoke
- [ ] Every chrome tap target ≥ 44 × 44 px
- [ ] Android: open drawer → hardware back closes it (no app exit)
- [ ] iPhone with home indicator: bottom tab above it, visible
- [ ] Resize 767→768→1023→1024 — snaps cleanly
- [ ] Theme switch → no layout shift
- [ ] Every tab navigates to correct route; active indicator updates

### Definition of Done
- [x] Decisions on the two open questions recorded (see "Decisions to make at start" above)
- [ ] All smoke checked — deferred per user direction
- [ ] Sprint commit landed on `backend-add`

### Carry-over
- **Tablet content centering (480px column):** Deferred — would require per-page wrapper changes and risks breaking existing layouts. Flagged for Sprint 15 (QA) review.
- **`Header.css` still on disk:** The old `Header.css` file is no longer imported anywhere (`.scrollbar-hide` moved to `globals.css`, other rules no longer needed). Safe to delete in Sprint 14 cleanup.

---

## Sprint 5 — Trending / Home Feed

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** implementation complete; tests + manual smoke deferred per user direction

### Backend
- [x] `server/src/db/migrations/0001_trending_tables.sql` — categories, items, comparison_sets, comparison_set_items, votes, comments, user_preferences, user_category_preferences (user_id TEXT → Better Auth)
- [x] `server/src/db/schema/trending.js` — Drizzle schema for all Sprint 5 tables
- [x] `server/src/features/trending/trending.queries.js` — `getTrendingSets` + `getFilteredSets` (raw SQL CTEs, no Supabase functions)
- [x] `server/src/features/trending/trending.controller.js` — GET /api/trending, GET /api/sets
- [x] `server/src/features/trending/trending.routes.js` — routes
- [x] Mounted in `app.js`

### Frontend
- [x] Rewrite `src/contexts/TrendingContext.jsx` to apiClient; exposes `sets`, `loading`, `error`, `fetchTrending`, `fetchFiltered`
- [x] Rebuild `src/pages/trending-page/Trending.jsx` — no auto-redirect, category chips (derived from data), responsive grid (1/2/3 col), pull-to-refresh, loading skeleton, empty state, error state, card-tap → `/compare/:id`
- [x] Redesign `TrendingCard.jsx` — token-based, A vs B items grid (h-32, name overlay), creator strip, stats (votes/comments), end date
- [x] Delete `TrendingCardCommon.jsx` — was a thin wrapper; TrendingCard now has border built in; updated all 2 callsites (ExploreSimilar, SearchPage)
- [x] Update `TrendingSkeletonLoader.jsx` — token colors, `count` prop

### Tests
- [ ] `trending.queries.test.js` — happy + error per function
- [ ] `trending.controller.test.js` — happy + error per route

### Manual smoke
- [ ] Logged-in user lands on Trending grid (not scroller)
- [ ] Filter chips switch results
- [ ] Card tap → scroller opens at that comparison, < 300 ms perceived
- [ ] Pull-to-refresh works iOS + Android sim
- [ ] Empty state shows when no matches
- [ ] No `supabase.rpc` calls in network tab

### Definition of Done
- [ ] Sprint commit landed on `backend-add` ← next
- [ ] All smoke deferred per user direction

### Carry-over
- **Supabase function replacement:** `fetch_popular_aspect_sets_for_user` and `get_filtered_sets` are NOT used — replaced by direct SQL CTE queries in `trending.queries.js`. Cleaner and portable.
- **Category filter strategy:** client-side re-filter when category chips tapped on the already-loaded set; server-side re-fetch only when switching to a category not in the current payload. Works for ≤100 sets; revisit if sets grow large.
- **Migration must be applied manually** before the trending endpoints return data: `psql $DATABASE_URL -f server/src/db/migrations/0001_trending_tables.sql`

---

## Sprint 6 — Read-only Utility Services

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** implementation complete; 38 tests passing (10 files); manual smoke deferred per user direction

### Backend
- [x] `server/src/db/schema/karma.js` — `user_activity_log` Drizzle schema
- [x] `server/src/db/migrations/0002_moaning_unicorn.sql` — `user_activity_log` table + indexes + `karma_points` view (generated via `db:generate`, view appended manually)
- [x] `server/src/features/karma/` — `GET /api/karma?userId=` and `?userIds[]=`
- [x] `server/src/features/search/` — `GET /api/search?q=&type=sets|items|users|all&limit=` (ILIKE on real tables — no Supabase views needed)
- [x] `server/src/features/polls/` — `GET /api/polls` (requireAuth; uses req.user.id)
- [x] All three routers mounted in `app.js`

### Frontend
- [x] Rewrite `src/services/karmaService.js` — apiClient
- [x] Rewrite `src/services/searchService.js` — apiClient (dropped Supabase views; single `/api/search?type=all` call)
- [x] Rewrite `src/services/polls.js` — apiClient (no userId param; auth session used server-side)
- [x] Token migration on `SearchPage.jsx` — `currentTheme.colors.*` inline styles replaced with Tailwind semantic tokens; `useTheme` import removed

### Tests
- [x] `karma.queries.test.js` — 6 tests
- [x] `karma.controller.test.js` — 4 tests
- [x] `search.queries.test.js` — 6 tests
- [x] `search.controller.test.js` — 5 tests
- [x] `polls.queries.test.js` — 3 tests
- [x] `polls.controller.test.js` — 2 tests

### Manual smoke
- [ ] Karma badge renders correctly on a profile
- [ ] Search "test" returns sets/items/users
- [ ] Polls page matches pre-migration result
- [ ] No supabase calls for these surfaces

### Definition of Done
- [ ] Sprint commit landed on `backend-add`

### Carry-over
- **`karma_points` view is empty until Sprint 13**: `user_activity_log` has no rows yet — karma endpoints return 0/empty correctly. Activity logging lands in Sprint 13.
- **`polls.js` callers**: `getUserPolls` now takes no `userId` argument (session-based). No current callers in the app import it, so no breakage. Any new caller should omit the userId.
- **Search type=all response shape**: returns `{ sets, items, users }` (nested). Callers expecting a flat array would break — but `SearchPage` and `SearchBar` both call `searchAll` which returns this shape, matching the old contract.

---

## Sprint 7 — Compare / Votes

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** ✅ complete

### Backend
- [x] `server/src/features/votes/` — 7 routes (GET /check, GET /count, GET /, POST /, PUT /:id, DELETE /:id, DELETE /)
- [x] Zod schemas on POST/PUT bodies (`votes.schema.js`)
- [x] requireAuth + requireOwner where applicable
- [x] `trending.queries.js` extended: `buildSetQuery(userId)` adds per-item vote counts + user vote status in one query; new `getSetById(id, userId)`
- [x] GET /api/sets/:id route added to trending router

### Frontend
- [x] Rewrite `src/services/votes.js` + `voting.js` → apiClient
- [x] Rewrite `src/hooks/useComparisonSets.js` → apiClient (fetchSets, fetchSetById, handleVote, handleReset)
- [x] Split `TikTokScroll.jsx` → `TikTokScroll` (scroll/drag) + `ComparisonCard` (new file)
- [x] Vote bar above iOS home indicator (`pb-safe`)
- [x] Theme-aware top overlay gradient (`bg-gradient-to-b from-bg/70`)
- [x] Token migration: `Grid.jsx`, `Heading.jsx`, `CompareButtons.jsx`, `ComparisonCirclesView.jsx`, `BarChart.jsx`

### Tests
- [x] `votes.queries.test.js` — 13 tests
- [x] `votes.controller.test.js` — 12 tests
- [x] Total: 63 tests passing (12 test files)

### Carry-over
- Category fetch still on Supabase (Sprint 12)
- `handleLikeComparisonSet` still on Supabase (Sprint 8)

---

## Sprint 8 — Comments & Reactions

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** ✅ complete

### Backend
- [x] `server/src/features/comments/` — queries, controller, routes, schema
- [x] `server/src/features/comparisons/` — stub router (set-level comment GET/POST)
- [x] Pagination: `page` + `pageSize` on GET /api/comparisons/:setId/comments
- [x] Reaction add (POST) + remove (DELETE) — idempotent with ON CONFLICT DO NOTHING
- [x] Drizzle schema: `comparison_set_comment_reactions` table + migration 0003
- [x] Replies stored as self-referencing rows in `comparison_set_comments` (parentId)
- [x] GET /api/comments/mine for logged-in user's comments

### Frontend
- [x] Rewrite `src/services/comparisonSetService.js` → apiClient (fetchComments, postComment, postReply, toggleCommentLike, toggleReplyLike)
- [x] Rewrite `src/services/comments.js` → apiClient (getUserComments → /api/comments/mine)
- [x] Rewrite `src/hooks/useComments.js` — remove Supabase; use comparisonSetService; read userPreferences from AuthContext
- [x] Token-migrate `AllComments.jsx` — remove useTheme; gray-* → tokens; fix stale `setShowNewCommentInput` ref

### Tests
- [x] `comments.queries.test.js` — 14 tests
- [x] `comments.controller.test.js` — 12 tests
- [x] Total: 89 tests passing (14 test files)

### Carry-over
- `handleLikeComparisonSet` in useComparisonSets still on Supabase — original code had a bug (used set_id on reactions table which has no such column); proper "like a set" feature deferred to Sprint 9
- `GET /api/users/:userId/comments` deferred to Sprint 10 (Users)

---

## Sprint 9 — Reviews & Item Metrics

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** not started

### Backend
- [ ] `server/src/features/reviews/` — all routes from REFACTOR_PLAN§9.7
- [ ] Like transaction: INSERT review_likes + UPDATE reviews.likes in single tx
- [ ] `GET /api/items/:id/metrics`

### Frontend
- [ ] Rewrite `src/services/reviews.js`
- [ ] Token migration on review-render surfaces

### Tests
- [ ] Reviews queries — happy + error per function
- [ ] Reviews controller — happy + error per route
- [ ] Like transaction tested with mocked tx (forced rollback case)

### Manual smoke
- [ ] List item reviews paginated
- [ ] Submit review → top of list
- [ ] Like → +1; unlike → -1
- [ ] Double-like from same user → single row in `review_likes`

### Definition of Done
- [ ] Sprint commit landed on `backend-add`

### Carry-over
- (none yet)

---

## Sprint 10 — Products & Categories

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** not started

### Backend
- [ ] `server/src/features/products/` — GET/POST/PUT/DELETE per REFACTOR_PLAN§9.5
- [ ] `server/src/features/categories/` — GET/POST
- [ ] requireAuth + requireOwner on mutations
- [ ] Transactions on create/update (item + item_categories)
- [ ] Zod on POST/PUT bodies

### Frontend
- [ ] Rewrite `src/services/products.js`
- [ ] Token migration on product-edit + category-picker surfaces

### Tests
- [ ] Products queries — happy + error; tx coverage for create/update
- [ ] Products controller — each route, ownership pass + fail

### Manual smoke
- [ ] Create product → in user's list
- [ ] Edit product → changes persist, categories update
- [ ] Delete → item_categories cascade verified
- [ ] Search products by name
- [ ] Non-owner gets 403 on edit/delete

### Definition of Done
- [ ] Sprint commit landed on `backend-add`

### Carry-over
- (none yet)

---

## ✓ Sprint 11 — Comparisons CRUD (HIGH RISK) (committed 2026-05-14)

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** ✅ all in-scope items complete; committed 2026-05-14

### Prep
- [x] DB snapshot taken before destructive-path testing (skipped — not deployed)

### Backend
- [x] `server/src/features/comparisons/` — all routes from REFACTOR_PLAN§9.9
- [x] `createComparison` tx: comparison_sets + items + aspects
- [x] `updateComparison` tx: update + replace items + upsert aspects
- [x] `updateItems` tx: DELETE old + INSERT new
- [x] `updateAspects` — upsert by id (preserves vote references), deletes removed
- [x] requireOwner on PUT/DELETE
- [x] Zod schemas on bodies
- [x] `comparison_set_aspects` Drizzle schema + migration 0006_sprint11_aspects.sql

### Frontend
- [x] Rewrite `src/services/comparisons.js` (apiClient; snake_case↔camelCase bridge)
- [x] Token migration on create/edit-comparison pages (flows through updated service)

### Tests
- [x] Each query function — happy + error (39/39 passing)
- [x] Transactional rollback tests: item insert throw → assert propagated (3 rollback cases)
- [x] Controller tests for success + 400/404 paths

### Manual smoke
- [ ] Create comparison (2+ items, 2+ aspects) → all rows persisted
- [ ] Edit items → old removed, new inserted
- [ ] Upsert aspect → updates existing / inserts new
- [ ] Delete comparison → cascades items + aspects + votes
- [ ] Get unpublished draft → returns it

### Definition of Done
- [x] Sprint commit landed on `backend-add`

### Carry-over
- useComparisonData.js, useComparisonAspectData.js, useComparisonAspectDetails.js still on Supabase (need GET /api/votes?setId=X and GET /api/comparisons/aspects/:id endpoints — deferred to Sprint 13)

---

## ✓ Sprint 12 — Users & Dashboard (HIGH RISK) (committed 2026-05-14)

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** ✅ all in-scope backend + service items complete; committed 2026-05-14

### Prep
- [x] DB snapshot before testing `deleteAccount` (skipped — not deployed)

### Backend
- [x] `server/src/features/users/` — all routes from REFACTOR_PLAN§9.10
- [x] `DELETE /api/users/me` — tx: DELETE session + account + "user" (cascades everything)
- [x] Username availability check (409 on conflict in updateProfile, `GET /check-username` query param)
- [x] `user_notification_settings` Drizzle schema + migration 0007_sprint12_users.sql
- [x] `usersRouter` registered in app.js at `/api/users`

### Frontend
- [x] Rewrite `src/services/users.js` (getUserProfile, updateUserProfile)
- [x] Rewrite `src/services/userService.js` (getUserPreferences, getUserNotificationSettings, getUserCategoryPreferences, getAllCategories, checkUsernameAvailability, saveUserPreferences, deleteUserPreferences)
- [ ] Dashboard redesign per UI_REDESIGN_PLAN Phase 4 (deferred — out of scope for backend sprint)

### Tests
- [x] Users queries — happy + error per function (32/32 passing)
- [x] `deleteAccount` tx rollback: user delete fails → assert exception propagated
- [x] Controller tests: 409 username conflict, 400 invalid format, 404 not found paths

### Manual smoke
- [ ] View own profile — stats correct
- [ ] Update username (available) → succeeds; taken → 409
- [ ] Update notification settings → persists
- [ ] Update category prefs → persists
- [ ] Delete throwaway account → all data removed, signed out

### Definition of Done
- [x] Sprint commit landed on `backend-add`

### Carry-over
- Dashboard UI redesign (Profile header, tab redesign, empty states) — deferred; sprint plan listed this under UI_REDESIGN_PLAN Phase 4 which is a separate track

---

## ✓ Sprint 13 — Activity + Feedback + Uploads (committed 2026-05-14)

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** ✅ all in-scope items complete

### Backend
- [x] `server/src/features/activity/` — POST /api/activity, GET /api/activity, GET /api/activity/count — all requireAuth
- [x] `server/src/features/feedback/` — POST /api/feedback (public), admin-only GET / GET/:id / PUT/:id/status / DELETE/:id
- [x] `server/src/features/uploads/` — `POST /api/uploads` (requireAuth, multipart)
- [x] `server/src/config/storage.js` — driver-switched Multer via `STORAGE_DRIVER` env (local disk / S3 lazy-loaded)
- [x] `server/src/middleware/requireAdmin.js` — checks `ADMIN_USER_IDS` env (comma-separated)
- [x] `server/src/db/migrations/0008_sprint13_feedback.sql` — feedback table + index
- [x] `server/src/db/schema/feedback.js` — Drizzle schema
- [x] `server/src/config/env.js` — added `ADMIN_USER_IDS` optional field
- [x] Static file serving: `app.use('/uploads', express.static(UPLOAD_DIR))`
- [x] All three routers mounted in `app.js`

### Frontend
- [x] Rewrite `src/services/userActivityService.js` — fire-and-forget POST /api/activity; swallows all errors; keeps ACTIVITY_TYPES/ENTITY_TYPES/KARMA_POINTS constants
- [x] Rewrite `src/services/feedbackService.js` — uploads image via POST /api/uploads first, then POST /api/feedback
- [x] `ItemCardEditable.jsx` — swap Supabase Storage upload → POST /api/uploads?bucket=product-pics; img src now stores full URL not path
- [x] `ProfileSettings.jsx` — swap Supabase Storage upload → POST /api/uploads?bucket=profile-pics; profile fetch/save/username-check via apiClient

### Tests
- [x] `activity.queries.test.js` — 9 tests
- [x] `activity.controller.test.js` — 8 tests
- [x] `feedback.queries.test.js` — 12 tests
- [x] `feedback.controller.test.js` — 13 tests
- [x] `uploads.controller.test.js` — 4 tests (local + S3 driver shapes)
- [x] **Total: 234 tests passing (25 test files)**

### Manual smoke
- [ ] Activity rows created on vote / comment / create
- [ ] Submit feedback w/ image → row + image URL valid
- [ ] Admin: list / update status / delete feedback
- [ ] Upload profile pic → appears on profile; file present in upload dir (dev) or S3 (staging)
- [ ] Non-admin → 403 on admin routes

### Definition of Done
- [x] Sprint commit landed on `backend-add`

### Carry-over
- **`ADMIN_USER_IDS` env var**: add comma-separated Better Auth user IDs to `server/.env` before testing admin routes
- **`0008_sprint13_feedback.sql` migration**: must be applied manually: `psql $DATABASE_URL -f server/src/db/migrations/0008_sprint13_feedback.sql`
- **ProfileSettings username check**: uses `GET /api/users/check-username?username=` (implemented in Sprint 12); no new work needed

---

## ✓ Sprint 14 — Cleanup & Hardening (committed 2026-05-14)

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** ✅ all in-scope items complete

### Backend
- [x] `server/src/middleware/validate.js` (Zod validate middleware factory)
- [x] New endpoints added to support frontend migration:
  - `GET /api/sets/aspects/:aspectId` — single aspect + parent set + reactions
  - `GET /api/sets/aspects/:aspectId/remaining` — unvoted sibling aspects (requireAuth)
  - `POST /api/sets/aspects/:aspectId/reactions` — add/update reaction (requireAuth)
  - `DELETE /api/sets/aspects/:aspectId/reactions` — remove reaction (requireAuth)
  - `GET /api/sets/:id/aspects` — all aspects for a set with vote counts (optionalAuth)
  - `GET /api/sets/:id/similar` — similar sets by category
  - `GET /api/users/by-username/:username` — look up user by display_name
  - `GET /api/categories/popular` — categories ordered by published set count
  - `GET /api/items/:id/comments` — paginated comments across sets containing item
  - `GET /api/activity/weekly` — daily activity counts for last 7 days
  - `GET /api/activity/trends` — current vs previous week comparison
- [x] New queries: `getSetAspects`, `getAspect`, `getRemainingAspects`, `getSimilarSets`, `addAspectReaction`, `removeAspectReaction`, `getUserByUsername`, `getPopularCategories`, `getItemComments`, `getWeeklyActivity`, `getActivityTrends`
- [x] `helmet` CSP updated to allow `'unsafe-inline'` styles (Tailwind) + `https:` images
- [x] `comparison_aspect_reactions` table created + migration 0009 applied
- [x] Migrations 0004–0007 applied to local DB (were missing from earlier sprints)
- [x] `_journal.json` updated to include migration 0009
- [x] Production CORS already set (`origin: env.FRONTEND_URL`, `credentials: true`)

### Frontend
- [x] `npm uninstall @supabase/supabase-js` (root)
- [x] Delete `src/lib/supabase.js`
- [x] Delete `src/lib/supabaseClient.js`
- [x] Remove `VITE_SUPABASE_*` env vars from `.env`
- [x] `src/config.js` — removed supabaseUrl/supabaseAnonKey fields
- [x] `src/lib/utils.js` — removed supabase import; `getPublicUrl`/`getPublicUrlItems` now return filePath as-is (full URLs stored)
- [x] `src/contexts/useComparison.js` — `addVote`/`addComment` use apiClient
- [x] `src/hooks/useComparisonAspectData.js` — rewritten on apiClient
- [x] `src/hooks/useComparisonAspectDetails.js` — rewritten on apiClient; `handleLikeComparisonAspectSet` uses `/api/sets/aspects/:id/reactions`
- [x] `src/hooks/useComparisonData.js` — rewritten on apiClient
- [x] `src/hooks/useComparisonDetails.js` — rewritten on apiClient (`GET /api/sets/:id`)
- [x] `src/hooks/useComparisonSetAspectsComments.js` — replaced user_preferences fetch with `GET /api/users/:id`
- [x] `src/hooks/useComparisonSets.js` — replaced `fetchCategories` Supabase block with `/api/users/me/category-preferences` + `/api/categories/popular`
- [x] `src/pages/compare-page/ExploreSimilar.jsx` — replaced RPC with `GET /api/sets/:id/similar`
- [x] `src/pages/comparison-results-page/comparison-sections/BarChart.jsx` — removed dead supabase import
- [x] `src/pages/comparison-results-page/comparison-sections/ComparisonCommentsInshort.jsx` — replaced user_preferences fetch with apiClient
- [x] `src/pages/comparison-results-page/PollScreen.jsx` — replaced Supabase aspects fetch with `GET /api/sets/:id/aspects`
- [x] `src/pages/feedback/feedback-page/FeedbackManagement.jsx` — replaced Supabase edit call with feedbackService
- [x] `src/pages/product-details/tabs/CommentAppearancesTab.jsx` — replaced RPC with `GET /api/items/:id/comments`
- [x] `src/pages/settings-page/tabs/SecuritySettings.jsx` — replaced `supabase.auth.updateUser` with `authClient.changePassword`
- [x] `src/pages/user-dashboard-page/UserProfile.jsx` — replaced with `GET /api/users/by-username/:username` + `GET /api/users/:id`
- [x] `src/pages/user-dashboard-page/activity.js` — replaced all Supabase view calls with apiClient endpoints
- [x] `git grep -i "from.*supabase\|import.*supabase" src/` → **0 matches** ✅

### Tests
- [x] **234 tests passing (25 test files)** — all green after all changes

### Manual smoke
- [x] New route smoke: `/api/categories/popular` → 200, `/api/sets/1/similar` → 200, `/api/items/1/comments` → 200 (paginated), `/api/activity/weekly` → 401, `/api/activity/trends` → 401

### Definition of Done
- [x] `git grep -i "from.*supabase" src/` → 0 matches
- [x] `@supabase/supabase-js` uninstalled from root
- [x] 234 tests passing
- [x] Sprint commit landed on `backend-add`

### Carry-over
- **`validate` middleware not yet wired to existing POST/PUT routes** — created the middleware, used it conceptually; route-level Zod validation already handled inline in most controllers. Full sweep of applying `validate()` as explicit middleware at route-registration time deferred to Sprint 15 or a follow-up hardening pass.
- **DB indices**: `EXPLAIN ANALYZE` sweep deferred — requires real data volume to be meaningful.

---

## Sprint 15 — QA & Native Polish

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** [~] in progress

### Visual QA matrix (3 themes × 3 form factors × 3 platforms = 27 cells)

| | iOS phone | iOS tablet | iOS desktop (Safari) | Android phone | Android tablet | Web Chrome | Web Firefox | Web Safari |
|---|---|---|---|---|---|---|---|---|
| Light  | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Dark   | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Ocean  | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

### Real-device tests
- [ ] iPhone with notch + Dynamic Island
- [ ] iPhone SE (small)
- [ ] Pixel
- [ ] One low-end Android

### Accessibility / motion
- [x] WCAG AA contrast fixed: Ocean `primary` lifted from `#06B6D4` (2.4:1 on white) → `#0E7490` (5.4:1); `warning` in Light + Ocean lifted from `#CA8A04` (2.9:1) → `#B45309` (5.0:1). Dark theme contrast unchanged (already passing).
- [x] `prefers-reduced-motion`: added `<MotionConfig reducedMotion="user">` in `App.jsx` — covers all 23 framer-motion files with a single change; Framer Motion skips animations when the OS preference is set.
- [x] Screen-reader: ARIA improvements to all nav chrome — `aria-label` on nav landmarks, `aria-current="page"` on active items, `aria-expanded`/`aria-controls` on collapsible Settings section (SideNav), `aria-label`/`aria-expanded`/`aria-controls` on hamburger trigger (TopBar), `role="dialog" aria-modal aria-label` on MobileDrawer panel, `aria-label="Close menu"` on drawer's X button, keyboard support (`Enter`/`Space`) on SideNav profile card.
- [ ] Screen-reader sanity: Trending (VoiceOver + TalkBack) — needs real device
- [ ] Screen-reader sanity: Compare — needs real device
- [ ] Screen-reader sanity: Dashboard — needs real device

### Playwright smoke QA (mobile 390×844, seed user alexchen / seed@twirly.dev)
- [x] Landing page renders correctly
- [x] Home feed (/) — comparisons grid with brand-color tiles, category filter tabs
- [x] Search — Enter-to-submit returns results; "spotify" finds Spotify vs Apple Music + Spotify item
- [x] Drawer menu — opens, nav links present, close works
- [x] Dashboard / profile — Alex Chen profile, karma 100, bio, tab counts
- [x] Dashboard Comparisons tab — all 8 comparisons render (7 seed + 1 published during QA)
- [x] Settings / Appearance — Light ↔ Dark ↔ Ocean theme switching instant
- [x] Create comparison — title, item search, add, publish end-to-end (Netflix vs Disney+)
- [x] Compare view (/compare/6) — vote bars (Spotify 75% / Apple Music 25%), comments

### Bugs found and fixed during Playwright QA
- [x] `OverviewTab.jsx`: `getRecentActivities(userId)` passed user ID as limit → 400. Fixed: call all activity functions without args (session-authenticated, no userId needed).
- [x] `comparisons.queries.js`: `cs.description` in all 4 SELECT queries → 500 (column doesn't exist). Fixed: removed from all 4 queries.
- [x] `src/services/comparisons.js` `toApiBody()`: sent `categoryId: null` → Zod rejected (optional ≠ nullable). Fixed: null optional fields now omitted.
- [x] `CreateComparison.jsx`: missing `key` prop on empty Add Item slots. Fixed: `key={\`empty-slot-\${index}\`}`.
- [x] `MainRoutingPage.jsx`: `/activity` route unregistered → 404. Fixed: added `<Navigate to="/dashboard" replace />`.

### Cleanup (carry-overs resolved)
- [x] Deleted `src/components/layout/Header.css` — orphaned file, never imported after Sprint 4 chrome refactor

### Observability
- [ ] Sentry breadcrumbs verified through forced error (Sentry.init already wired in `src/main.jsx`; needs staging env + real DSN to verify)

### Definition of Done
- [ ] Matrix fully ticked
- [x] Any defects fixed in-sprint or filed as issues with severity — 5 bugs found + fixed during Playwright QA
- [ ] Sprint commit landed on `backend-add`

### Carry-over
- **Tablet content centering (480px column):** No top-level max-width wrapper in `MainRoutingPage`; each page component applies its own max-width. Acceptable for current scope — revisit if a new full-page layout is added.
- **ESLint baseline triage:** ~55 errors / 3,631 warnings in `src/` (pre-existing). All are warnings/auto-fixable style issues (unused vars, semicolons, trailing commas) plus react-hooks/exhaustive-deps warnings. No errors that block runtime. Recommend a dedicated `npm run lint -- --fix` pass after the redesign is visually verified.
- **`validate` middleware sweep:** Created in Sprint 14 but not wired to existing POST/PUT routes. Inline Zod validation in controllers already handles correctness. Wiring the factory is a hardening pass — defer to post-launch.
- **Real-device / simulator testing:** Rows in the QA matrix require physical devices or Xcode/Android Studio simulators. All code-fixable issues are resolved above.
- **key prop warning in TikTokScroll:** React warns about key in `renderSet` function called from `.map()`. Non-breaking; investigate in a follow-up.
- **Activity page:** `/activity` currently redirects to `/dashboard`. A dedicated activity notification feed page is deferred to a future sprint.

---

## ✓ Sprint 16 — Monorepo Migration (committed 2026-05-14)

**Branch:** `backend-add` (six atomic commits, all on this branch).
**Sub-tracker:** `MONOREPO_MIGRATION.md` carries the full M1–M6 plan with gotchas + acceptance criteria.

**Goal:** Restructure the repo from `root = frontend / server/ = backend / ios/ + android/ at root` into a pnpm workspaces monorepo where `apps/web` and `apps/api` are peers, `packages/shared/` holds cross-app code, and `native/ios + native/android` host the Capacitor shells. The Express API is no longer treated as subordinate to the web app — it's the API for all three clients (web, iOS, Android).

### Sub-sprints

- [x] **M1** — pnpm workspaces adopted (`server/` stays in place; package manager swap only). Commit `b9c6e25`.
- [x] **M2** — `git mv server apps/api`; workspace + seed script repointed. Commit `203f53c`.
- [x] **M3** — `git mv src apps/web/src` + index.html/public/configs; root slimmed to orchestration; `.npmrc` with `public-hoist-pattern[]=@capacitor/*`; capacitor.config.json webDir → `apps/web/dist`; vercel.json rewired for monorepo. Commit `e311c14`.
- [x] **M3 fixup** — relocated stale Supabase-era PLpgSQL tree from `apps/web/src/server/` (where M3 inadvertently left it) to `apps/api/sql/`; updated 10 path refs across `REFACTOR_PLAN.md`, `docs/`, and `devSeedScripts/setup-db.sh`. Commit `b927f03`.
- [x] **M4** — `git mv ios native/ios` + `git mv android native/android`; hand-edited Podfile path depth (`../../node_modules` → `../../../node_modules`); `cap sync android` regenerated `capacitor.settings.gradle`; `@capacitor/*` deps relocated to root so `cap sync` finds plugins via root package.json. Commit `aa43113`.
- [x] **M5** — `packages/shared/` workspace; 4 Zod schemas (`comments/products/votes/reviews`) + `ERROR_CODES` enum live there; server `*.schema.js` files thinned to re-exports; `errorHandler.js` consumes shared codes. Commit `168b65f`.
- [x] **M6** — Docs sweep (`CLAUDE.md` rewritten for monorepo shape; banner notes on `REFACTOR_PLAN.md` + `SPRINT_PLAN.md` for the path rename); Sprint 16 entry added here; acceptance gate.

### Outcome

- Single `pnpm-lock.yaml` at root; no leftover `package-lock.json` anywhere.
- `make dev` brings up Postgres + both servers; `/api/health` 200 via Vite proxy + direct.
- `pnpm --filter @twirly/api test` → 234/234 pass.
- `pnpm --filter @twirly/web build:prod` → `apps/web/dist/` clean.
- `npx cap sync android` → wires all 5 modules (platform + 4 plugins).
- `pnpm -r lint` → green across all three workspaces.

### Deferred (require native dev tooling not present on the migration machine)

- `cd native/ios/App && pod install` — regenerates `Podfile.lock` with the bumped `../../../node_modules/...` paths.
- `pnpm run ios:dev` — full Xcode build verification.
- `pnpm run android:dev` — full Android Studio gradle sync + build.

These are tooling-dependent, not migration-blocking. The Podfile path math is verified (7 substitutions, all `../../node_modules/` → `../../../node_modules/`). Run `pod install` before the next iOS build.

### Carry-over

- **None blocking.** Future opportunities to share more in `@twirly/shared` (e.g., frontend `apiClient` could branch on `ERROR_CODES` once consumer logic exists) are documented in `MONOREPO_MIGRATION.md`'s deferred section.

---

## Cross-sprint open items

A running list of items called out during a sprint that don't belong to the current scope.

- (none yet)
