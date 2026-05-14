# Twirly — Sprint Tracker

**Purpose:** Live progress board for the work described in `SPRINT_PLAN.md`. Agents update this file after every task. **This file — not chat memory — is the source of truth for "what's done."**

**Last updated:** 2026-05-14
**Current sprint:** Sprint 6 (Read-only Utility Services) — implementation complete; tests passing; manual smoke deferred per user direction.

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

## Sprint 11 — Comparisons CRUD (HIGH RISK)

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** not started

### Prep
- [ ] DB snapshot taken before destructive-path testing

### Backend
- [ ] `server/src/features/comparisons/` — all routes from REFACTOR_PLAN§9.9
- [ ] `createComparison` tx: comparison_sets + items + aspects
- [ ] `updateComparison` tx: update + replace items + upsert aspects
- [ ] `updateItems` tx: DELETE old + INSERT new
- [ ] `updateAspects` UPSERT (ON CONFLICT DO UPDATE)
- [ ] requireOwner on PUT/DELETE
- [ ] Zod schemas on bodies

### Frontend
- [ ] Rewrite `src/services/comparisons.js`
- [ ] Token migration on create/edit-comparison pages

### Tests
- [ ] Each query function — happy + error
- [ ] Transactional rollback test: mock items insert to throw → assert comparison row rolled back
- [ ] Controller tests for success + ownership-fail paths

### Manual smoke
- [ ] Create comparison (2+ items, 2+ aspects) → all rows persisted
- [ ] Edit items → old removed, new inserted
- [ ] Upsert aspect → updates existing / inserts new
- [ ] Delete comparison → cascades items + aspects + votes
- [ ] Get unpublished draft → returns it

### Definition of Done
- [ ] Sprint commit landed on `backend-add`

### Carry-over
- (none yet)

---

## Sprint 12 — Users & Dashboard (HIGH RISK)

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** not started

### Prep
- [ ] DB snapshot before testing `deleteAccount`
- [ ] Throwaway test user created for delete path

### Backend
- [ ] `server/src/features/users/` — all routes from REFACTOR_PLAN§9.10
- [ ] `DELETE /api/users/me` — multi-table cascade in FK order, in transaction
- [ ] Username availability check

### Frontend
- [ ] Rewrite `src/services/userService.js` + `users.js`
- [ ] Dashboard redesign per UI_REDESIGN_PLAN Phase 4:
  - [ ] Profile header (avatar, name, @username, member-since, follower/following)
  - [ ] Tabs: Your Comparisons / Your Votes / Followers
  - [ ] Empty state per tab with next-action CTA
  - [ ] Create Comparison entry from dashboard

### Tests
- [ ] Users queries — happy + error per function
- [ ] `deleteAccount` tx: mock each table delete, verify FK order, force one to throw → assert rollback
- [ ] Controller tests for ownership-guarded routes

### Manual smoke
- [ ] View own profile — stats correct
- [ ] Update username (available) → succeeds; taken → 409
- [ ] Update notification settings → persists
- [ ] Update category prefs → persists
- [ ] Tab switching ≤ 150 ms
- [ ] Empty states don't look like errors
- [ ] Delete throwaway account → all data removed, signed out

### Definition of Done
- [ ] Sprint commit landed on `backend-add`

### Carry-over
- (none yet)

---

## Sprint 13 — Activity + Feedback + Uploads

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** not started

### Backend
- [ ] `server/src/features/activity/` — POST/GET/count, auth required
- [ ] `server/src/features/feedback/` — GET/POST/PUT/DELETE, admin-only on list/update/delete
- [ ] `server/src/features/uploads/` — `POST /api/uploads` (auth)
- [ ] `server/src/config/storage.js` — driver-switched Multer (local/S3)

### Frontend
- [ ] Rewrite `src/services/userActivityService.js`
- [ ] Rewrite `src/services/feedbackService.js`
- [ ] Replace Supabase Storage upload calls with `POST /api/uploads`

### Tests
- [ ] Activity queries + controller — happy + error
- [ ] Feedback queries + controller — happy + error
- [ ] Storage driver smoke — returns expected key shape in test mode

### Manual smoke
- [ ] Activity rows created on vote / comment / create
- [ ] Submit feedback w/ image → row + image URL valid
- [ ] Admin: list / update status / delete feedback
- [ ] Upload profile pic → appears on profile; file present in upload dir (dev) or S3 (staging)
- [ ] Non-admin → 403 on admin routes

### Definition of Done
- [ ] Sprint commit landed on `backend-add`

### Carry-over
- (none yet)

---

## Sprint 14 — Cleanup & Hardening

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** not started

### Backend
- [ ] `server/src/middleware/validate.js` (Zod)
- [ ] Apply `validate` to every POST/PUT route across all features
- [ ] Sweep — confirm `requireOwner` on every owner-protected route
- [ ] `helmet` CSP review (allow Tailwind / inline styles)
- [ ] Production CORS config (`origin: env.FRONTEND_URL`, `credentials: true`)
- [ ] Production logging: raw JSON in `NODE_ENV=production`
- [ ] Optional: serve `dist/` from Express in prod
- [ ] `EXPLAIN ANALYZE` on top 5 hot queries; add indices for any sequential scans on large tables

### Frontend
- [ ] `npm uninstall @supabase/supabase-js` (root)
- [ ] Delete `src/lib/supabase.js`
- [ ] Remove `VITE_SUPABASE_*` env vars from all `.env` files
- [ ] `git grep -i supabase src/` → 0 matches

### Tests
- [ ] `validate.test.js` — good body passes, bad body 400
- [ ] 1 validation test per `validate`-guarded route as it's wired

### Manual smoke
- [ ] Every mutating route rejects bad input with 400 + Zod shape
- [ ] CORS works from twirlyapp.com; rejected from random origin
- [ ] CSP doesn't break Tailwind / inline styles
- [ ] Prod build serves frontend from Express correctly

### Definition of Done
- [ ] Sprint commit landed on `backend-add`

### Carry-over
- (none yet)

---

## Sprint 15 — QA & Native Polish

**Branch:** `backend-add` (consolidated per revised strategy)
**Status:** not started

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
- [ ] WCAG AA contrast across major pages
- [ ] `prefers-reduced-motion` respected in framer-motion components
- [ ] Screen-reader sanity: Trending (VoiceOver + TalkBack)
- [ ] Screen-reader sanity: Compare
- [ ] Screen-reader sanity: Dashboard

### Observability
- [ ] Sentry breadcrumbs verified through forced error

### Definition of Done
- [ ] Matrix fully ticked
- [ ] Any defects fixed in-sprint or filed as issues with severity
- [ ] Sprint commit landed on `backend-add`

### Carry-over
- (none yet)

---

## Cross-sprint open items

A running list of items called out during a sprint that don't belong to the current scope. Triage at the start of Sprint 15.

- (none yet)
