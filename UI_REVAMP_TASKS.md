# UI Revamp — Parallel Tasks

_Last updated: 2026-05-14_

Atomic tasks for parallel workers on the same branch (`backend-add`), picked up in **any order**. Each task owns its own files so concurrent workers don't fight over the same diff.

## Working rules (every task)

0. **Read `DESIGN_SYSTEM.md` first.** It is the single source of truth for the riso-zine aesthetic: palette tokens (`t.bg`, `t.ink`, `t.red`, `t.blue`, `t.purple`, `t.mustard`, `t.blend`), the three fonts and their roles (DM Serif Display / Fraunces / Caveat), the shared primitives under `src/components/riso/` (`PaperGrain`, `Halftone`, `HandUnderline`, `HandArrow`, `Tape`, `StarStamp`), the motion patterns, the layout conventions, and the copy principles. **Do not invent new visual language.** If the page you're touching doesn't fit the system, the system wins — adapt the page. If you genuinely need something new, stop and surface it to the user before adding it.
1. **Code quality is non-negotiable.** This is the highest-order rule. Clean, readable, idiomatic React. No fallback logic, no legacy shims, no commented-out blocks, no "just in case" branches, no Supabase reintroductions. Names describe intent. Components do one thing. If you find dead code on a page you're touching, delete it. A worker that ships a working-but-messy page has failed the task — the file should read like someone enjoyed writing it.
2. **Don't break anything.** The feature surface stays the same — only look, motion, layout, and code quality change. No silent feature removals.
3. **Theme tokens only.** All colors come from the theme (`t.*` per `DESIGN_SYSTEM.md`, or `useTheme()` / `currentTheme.colors.*` where the older API is still in place). Never hardcode hex. If you need a token that doesn't exist, stop and surface it.
4. **Service layer stays.** Don't bypass `apps/web/src/services/*`. If a page in your task already violates this (see `CLAUDE.md` "Known debt"), migrate the calls as part of your task — that's the natural moment.
5. **Hands-off, globally:**
   - `apps/web/src/pages/MainRoutingPage.jsx` (routes)
   - `apps/web/src/App.jsx` (provider stack)
   - `apps/web/src/contexts/*` (esp. `ThemeContext`, `AuthContext` — read, don't reshape)
   - `apps/web/src/lib/apiClient.js`
   - `apps/web/src/styles/themes.js` (tokens — propose changes, don't make them silently)
   - `apps/web/src/components/riso/*` (shared primitives — extend additively only, never break existing exports)
   - `tailwind.config.js`, `vite.config.js`, `.eslintrc.cjs`
   - `apps/api/**`, `packages/shared/**`
   - `pnpm-lock.yaml` (don't add deps without telling the user)
6. **Lint clean.** `pnpm --filter @twirly/web lint` must pass with 0 errors / 0 warnings.
7. **Verify in browser.** `make dev`, click through the actual surface on mobile width (~390px) *and* desktop. Lint and type-checks do not verify feature correctness.
8. **Commit small, pull often.** Rebase before pushing; tiny merges beat big merges.
9. **Available libs already in `apps/web/package.json`** — prefer these over new deps:
   `framer-motion`, `lucide-react`, `@heroicons/react`, `sonner` (toasts), `react-swipeable`, `react-intersection-observer`, `react-infinite-scroll-component`, `recharts`, `chart.js`, `date-fns`, `tailwind-merge` + `clsx`, `react-mentions`, `react-colorful`, `react-responsive`, `react-share`, `react-router-dom@7`, `zod`.
10. **"Suggestions"** in each task are my ideas — extras, not orders. Bring your own judgment; ignore mine when yours is better. **But the `DESIGN_SYSTEM.md` is not a suggestion — it's the contract.**

---

## Lock protocol (read before claiming a task)

This file is the tracker. The **Status** column in the task index is the single source of truth for who owns what. Locks are just edits to this file — workers share one branch and **commits are not per-task**. The user decides when to commit (one big commit later, or batched at checkpoints).

### Status legend

| Symbol | Meaning |
|---|---|
| `[ ]` | Available — nobody owns it |
| `[~]` | In progress — locked by a worker |
| `[x]` | Done — code shipped on the branch, verified |
| `[!]` | Blocked — see the note in the row's `Notes` column |

### Claiming a task

1. **Re-read this file fresh from disk.** Don't trust a stale snapshot. If your tooling caches, force a reload.
2. Find a row where **Status is `[ ]`**. Skip `[~]`, `[x]`, `[!]`. Cross-check the collision matrix at the bottom — if your candidate's files overlap a `[~]` row, pick a different task.
3. Edit **only your chosen row** in the task index:
   - `Status:  [ ] → [~]`
   - `Owner:   — → @your-handle`
   - `Started: — → YYYY-MM-DD HH:MM`
4. Save the file.
5. **Re-read the file once more.** Confirm your claim is the only change to that row and nobody else claimed the same task in between. If two workers raced and the row now shows someone else's handle, back off and pick a different task. This is the entire concurrency story — there is no git lock; the tracker file is the lock.

Do not write any other code before step 5 completes.

### Working

- Stay inside your task's "Owns" file list. If you need to reach outside, stop and ask the user.
- Pull (or refresh) the tracker file periodically — other workers' locks land asynchronously and you want to see them.
- You don't need to commit per task. The user will commit when they choose. Just keep the working tree clean and lint-passing as you go.
- If you do commit (e.g., the user asks you to checkpoint), prefix the message with the task ID(s) so the history is easy to follow: `feat(ui): T07 + T08 — trending and search`. One commit can cover multiple completed tasks.

### Releasing a task (done)

1. Re-read the tracker.
2. Edit your row: `[~] → [x]`, fill in `Finished: YYYY-MM-DD HH:MM`. Leave Owner set so we know who shipped it.
3. Save.

A `[x]` row is **frozen**. Don't reopen it. If a regression surfaces later, add a fresh row at the bottom of the index (`T35`, `T36`, …) describing the follow-up.

### Blocking a task

If you hit something you can't resolve (missing API, ambiguous spec, depends on another `[~]` task), flip the row to `[!]` and put a one-line reason in `Notes`. Leave Owner set to yourself until the block clears, so the user knows who to ping. When unblocked, `[!]` → `[~]` and continue.

### Stale locks

A `[~]` row that hasn't moved in **48h** with no visible progress on the files it owns is considered abandoned. Anyone may reclaim it:

1. Check the owned files for recent changes (`git log -- <path>` or `git status`).
2. If genuinely stale, edit the row: `[~] → [ ]`, clear Owner/Started, add a Notes entry like `released stale lock 2026-05-16, prior owner @x`.
3. Re-claim normally if you're picking it up.

### One worker, multiple tasks

Fine, but **don't hold more than two `[~]` at once**. Long-held locks block everyone else. Finish or release.

---

## Task index

Edit only the row for the task you're claiming/releasing. Keep columns aligned — it's diff-friendly that way.

| # | Status | Task | Primary folder | Owner | Started | Finished | Notes |
|---|---|---|---|---|---|---|---|
| T01 | `[x]` | App Chrome — Header + TopBar | `components/layout/Header.jsx`, `TopBar.jsx` | @claude | 2026-05-14 13:00 | 2026-05-14 13:30 | — |
| T02 | `[x]` | App Chrome — SideNav (desktop) | `components/layout/SideNav.jsx` | @claude | 2026-05-14 13:35 | 2026-05-14 13:55 | — |
| T03 | `[x]` | App Chrome — BottomTabs (mobile) | `components/layout/BottomTabs.jsx` | @claude | 2026-05-14 01:25 | 2026-05-14 01:40 | — |
| T04 | `[x]` | App Chrome — MobileDrawer | `components/layout/MobileDrawer.jsx` | @claude | 2026-05-14 14:00 | 2026-05-14 14:20 | — |
| T05 | `[x]` | App Chrome — Footer | `components/layout/Footer.jsx` | @claude | 2026-05-14 10:50 | 2026-05-14 11:05 | — |
| T06 | `[x]` | App Chrome — Search bar component | `components/layout/search-bar/` | @claude | 2026-05-14 19:45 | 2026-05-14 20:05 | — |
| T07 | `[x]` | Trending / home feed | `pages/trending-page/` | @claude | 2026-05-14 10:00 | 2026-05-14 10:45 | — |
| T08 | `[x]` | Search page | `pages/search/search-page/` | @claude | 2026-05-14 11:00 | 2026-05-14 11:45 | — |
| T09 | `[x]` | Compare — Scroller shell + cards | `components/TikTokScroll.jsx`, `pages/compare-page/{Grid,ComparisonCard,Heading,CompareButtons}.jsx` | @claude | 2026-05-14 18:00 | 2026-05-14 18:45 | — |
| T10 | `[x]` | Compare — Aspect view | `pages/compare-page/CompareAspectView.jsx`, `pages/comparison-aspect-page/` | @claude | 2026-05-14 21:00 | 2026-05-14 21:45 | — |
| T11 | `[x]` | Compare — Results view | `pages/compare-page/CompareResultsView.jsx`, `pages/comparison-results-page/` | @claude | 2026-05-14 21:50 | 2026-05-14 22:25 | — |
| T12 | `[x]` | Compare — Comments + Explore similar | `pages/compare-page/{AllComments,ExploreSimilar}.jsx` | @claude | 2026-05-14 22:30 | 2026-05-14 22:45 | — |
| T13 | `[x]` | Product details — shell + header + tabs nav | `pages/product-details/{ProductDetails,ProductHeader,ProductTabs,QuickStats}.jsx` | @claude | 2026-05-14 16:15 | 2026-05-14 16:45 | — |
| T14 | `[x]` | Product details — tab content | `pages/product-details/tabs/` | @claude | 2026-05-14 17:00 | 2026-05-14 17:30 | — |
| T15 | `[x]` | Activity page | `pages/activity-page/` | @claude | 2026-05-14 11:10 | 2026-05-14 11:40 | — |
| T16 | `[x]` | User dashboard shell + Overview tab | `pages/user-dashboard-page/UserDashboard.jsx`, `dashboard/tabs/OverviewTab.jsx` | @claude | 2026-05-14 14:00 | 2026-05-14 14:40 | — |
| T17 | `[x]` | Dashboard — Comparisons tab | `dashboard/tabs/{ComparisonsTab,ComparisonCard}.jsx` | @claude | 2026-05-14 14:45 | 2026-05-14 15:05 | — |
| T18 | `[x]` | Dashboard — Comments tab | `dashboard/tabs/CommentsTab.jsx` | @claude | 2026-05-14 15:10 | 2026-05-14 15:22 | — |
| T19 | `[x]` | Dashboard — Reviews tab | `dashboard/tabs/{ReviewsTab,ReviewCard}.jsx` | @claude | 2026-05-14 15:22 | 2026-05-14 15:35 | — |
| T20 | `[x]` | Dashboard — Products tab | `dashboard/tabs/ProductsTab.jsx` | @claude | 2026-05-14 15:35 | 2026-05-14 15:43 | — |
| T21 | `[x]` | Dashboard — Votes tab | `dashboard/tabs/VotesTab.jsx` | @claude | 2026-05-14 15:43 | 2026-05-14 15:55 | — |
| T22 | `[x]` | User profile page | `pages/user-dashboard-page/UserProfile.jsx` | @claude | 2026-05-14 16:00 | 2026-05-14 16:15 | — |
| T23 | `[x]` | Create / Edit comparison flow | `dashboard/tabs/{CreateComparison,AspectForm}.jsx` | @claude | 2026-05-14 20:10 | 2026-05-14 20:45 | — |
| T24 | `[x]` | Onboarding flow | `pages/onboarding/` | @claude | 2026-05-14 12:00 | 2026-05-14 12:40 | — |
| T25 | `[x]` | Settings — shell + drawer | `pages/settings-page/Settings.jsx` | @claude | 2026-05-14 18:00 | 2026-05-14 18:20 | — |
| T26 | `[x]` | Settings — Account + Profile + Security | three tabs | @claude | 2026-05-14 18:25 | 2026-05-14 18:55 | — |
| T27 | `[x]` | Settings — Appearance + Notifications + Privacy | three tabs | @claude | 2026-05-14 19:00 | 2026-05-14 19:30 | — |
| T28 | `[x]` | Settings — Billing + Language + Help | three tabs | @claude | 2026-05-14 19:35 | 2026-05-14 19:55 | — |
| T29 | `[x]` | Feedback — modal + management | `pages/feedback/` | @claude | 2026-05-14 19:45 | 2026-05-14 20:10 | — |
| T30 | `[x]` | Beta — Performance | `pages/beta/BetaPerformance.jsx` | @claude | 2026-05-14 19:00 | 2026-05-14 19:20 | — |
| T31 | `[x]` | Beta — Analytics | `pages/beta/BetaAnalytics.jsx` | @claude | 2026-05-14 19:25 | 2026-05-14 19:40 | — |
| T32 | `[x]` | 404 / Not-found | `components/NotFoundPage.jsx` | @claude | 2026-05-14 00:00 | 2026-05-14 00:30 | — |
| T33 | `[x]` | Shared common components polish | `components/common/` (Avatar, Button, Modal, LoadingScreen, ErrorScreen, PullToRefresh, BackgroundImage) | @claude | 2026-05-14 00:35 | 2026-05-14 01:20 | — |
| T34 | `[x]` | Shared cards polish | `components/common/common-cards/`, `components/common/comments/` | @claude | 2026-05-14 14:25 | 2026-05-14 15:00 | — |

---

## Tasks

### T01 — App Chrome: Header + TopBar
**Owns:** `apps/web/src/components/layout/Header.jsx`, `TopBar.jsx`
**Read-only refs:** `ThemeContext`, `AuthContext`, `useHeader` hook if present
**Keep:** export name + props of `<Header />` (consumed by `MainRoutingPage.jsx`)
**Done when:** mobile (56px) + desktop (64px) variants both render cleanly; logo, profile menu, theme indicator all wired; no hardcoded colors.
**Suggestions (optional):**
- `framer-motion` for the show/hide on scroll behavior — `useScroll` + `useTransform` is clean.
- Use `lucide-react` icons over inline SVG for consistency with the rest of the chrome.
- A `cmdk`-style quick-jump search trigger in the top bar is a nice touch but ships its own task (T06).

### T02 — App Chrome: SideNav (desktop)
**Owns:** `apps/web/src/components/layout/SideNav.jsx`
**Done when:** 256px sidebar pinned on `lg:` and up; active route highlight; collapses cleanly below `lg`.
**Suggestions:** `NavLink` from `react-router-dom@7` gives you `isActive` for free; `framer-motion`'s `layoutId` makes the active pill animate between items.

### T03 — App Chrome: BottomTabs (mobile)
**Owns:** `apps/web/src/components/layout/BottomTabs.jsx`
**Done when:** Tabs for `/`, `/search`, `/dashboard`, `/activity`; safe-area inset respected on iOS (`env(safe-area-inset-bottom)`); hidden on `lg:` and up.
**Suggestions:** Native-feeling tab bar — slightly enlarged active icon + label fade, `framer-motion` `AnimatePresence` for the label. Haptic feedback on native via `@capacitor/haptics` if we add it (don't add it inside this task — just leave a TODO).

### T04 — App Chrome: MobileDrawer
**Owns:** `apps/web/src/components/layout/MobileDrawer.jsx`
**Done when:** Slide-in drawer with backdrop, escape-to-close, swipe-to-close; Android hardware back closes drawer before navigating (use `@capacitor/app` `backButton` if available — gate on `Capacitor.isNativePlatform()`).
**Suggestions:** `framer-motion`'s `drag` with `dragConstraints` gives you swipe-to-close in ~10 lines. Lock body scroll when open.

### T05 — App Chrome: Footer
**Owns:** `apps/web/src/components/layout/Footer.jsx`
**Done when:** Appears on non-compare routes; hidden on `lg:` (SideNav takes its job); links work; respects safe-area.

### T06 — App Chrome: Search bar component
**Owns:** `apps/web/src/components/layout/search-bar/`
**Done when:** Reusable search input used by header + search page; debounced (`useDeferredValue` or `use-debounce`); keyboard hint on focus.
**Suggestions:** A `cmdk`-style command palette opened with `⌘K` on desktop is a great upgrade — `cmdk` is small (~6kb) and would be a justified new dep if you want to propose it. Otherwise: vanilla input + recent searches in localStorage.

### T07 — Trending / home feed
**Owns:** `apps/web/src/pages/trending-page/Trending.jsx`
**Read-only refs:** `TrendingContext`, `BackgroundImage`, `TrendingCard` (touched by T34)
**Done when:** Feed renders 2×2 grid on mobile (locked decision — see `project_landing_layout`), denser grid on desktop; infinite scroll; skeleton states; pull-to-refresh on mobile (`PullToRefresh` already exists).
**Suggestions:**
- `react-infinite-scroll-component` is already installed — use it.
- `framer-motion`'s `LayoutGroup` for cards re-flowing as new ones load.
- `react-intersection-observer` to lazy-load card images.
- Skeleton: a `motion.div` with a soft shimmer beats spinning loaders.

### T08 — Search page
**Owns:** `apps/web/src/pages/search/search-page/SearchPage.jsx`
**Done when:** Recent + trending searches when empty; debounced live results; empty state with a clear CTA; back-button returns to last scroll position.
**Suggestions:** Group results by type (items / users / comparisons) with sticky section headers. `framer-motion` `AnimatePresence` for result rows.

### T09 — Compare: Scroller shell + cards
**Owns:** `apps/web/src/components/TikTokScroll.jsx`, `apps/web/src/pages/compare-page/{Grid,ComparisonCard,Heading,CompareButtons}.jsx`
**Read-only refs:** `ComparisonDraftContext`, `services/*`
**Done when:** Vertical full-screen pager (one comparison per screen); image-first 2×2 grid for the 4 items; bottom CTA buttons feel native; swipe up loads next comparison.
**Suggestions:**
- `react-swipeable` (installed) for swipe; consider `framer-motion`'s `useDragControls` if you need finer control.
- For the snap-to-screen behavior, CSS `scroll-snap-type: y mandatory` is more performant than JS-driven page-flipping. Try CSS first.
- Preload neighbors' images via `react-intersection-observer`.

### T10 — Compare: Aspect view
**Owns:** `apps/web/src/pages/compare-page/CompareAspectView.jsx`, `apps/web/src/pages/comparison-aspect-page/` (incl. `PollScreenAspect.css`)
**Done when:** Single-aspect view (e.g., "Battery life") with all 4 items' votes/comments visible; smooth transition from the main compare card.
**Suggestions:**
- Get rid of `PollScreenAspect.css` if you can — port to Tailwind so the page lives in one file's mental model.
- `framer-motion` shared `layoutId` between the parent card's aspect chip and this view's title for a slick zoom-in.

### T11 — Compare: Results view
**Owns:** `apps/web/src/pages/compare-page/CompareResultsView.jsx`, `apps/web/src/pages/comparison-results-page/` (`AspectsProgressBar`, `CenterStage`, `ComparisonCircle`, `ComparisonCirclesView`, `PollScreen`, `comparison-sections/`, `sample_display_items/`)
**Done when:** Per-aspect winners visualized; overall winner highlighted; vote share readable at a glance.
**Suggestions:**
- `recharts` (installed) for the bar/donut visuals — `RadialBar` for circular vote shares looks great with brand colors.
- The "ComparisonCircle" pattern can become a `motion.div` with `animate={{ scale }}` driven by vote share — feels alive.
- If `sample_display_items/` is dev fixtures, move them to `__fixtures__/` or delete; don't ship them.

### T12 — Compare: Comments + Explore similar
**Owns:** `apps/web/src/pages/compare-page/{AllComments,ExploreSimilar}.jsx`
**Read-only refs:** `components/common/comments/*` (touched by T34)
**Done when:** Threaded comments load lazily, scroll smooth; "Explore similar" surfaces 3–6 adjacent comparisons.
**Suggestions:** `react-mentions` (installed) for @-mentions in comments if not already. `date-fns` `formatDistanceToNow` for relative times.

### T13 — Product details: shell + header + tabs nav
**Owns:** `apps/web/src/pages/product-details/{ProductDetails,ProductHeader,ProductTabs,QuickStats}.jsx`
**Done when:** Hero image + name + quick stats above the fold; sticky tab bar; tab state syncs to URL (`/item/:itemId/:tab`).
**Suggestions:**
- Parallax on the hero image with `framer-motion` `useScroll` is a cheap win for mobile feel.
- Sticky tab bar with `framer-motion` `layoutId` underline.

### T14 — Product details: tab content
**Owns:** `apps/web/src/pages/product-details/tabs/{AppearancesTab,CommentAppearancesTab,ReviewsTab,OtherChart}.jsx`
**Note:** `CommentAppearancesTab` is in the apiClient-debt list (`CLAUDE.md`); migrate its 3 calls to `services/items.js` while you're here.
**Suggestions:** `OtherChart.jsx` probably uses chart.js — fine, but `recharts` is already in the bundle too; only standardize if it's quick. Don't introduce both unless they're already both used.

### T15 — Activity page
**Owns:** `apps/web/src/pages/activity-page/ActivityPage.jsx`
**Watch:** `apps/web/src/pages/user-dashboard-page/activity.js` is the data helper (4 direct apiClient calls — see Known debt). Migrate to `services/activity.js` as part of this task.
**Suggestions:**
- Group by day with sticky date headers.
- `framer-motion` enter animations on first paint only (use `initial={false}` on subsequent renders).
- Empty state should tell the user *what* will appear here, not just "nothing yet."

### T16 — Dashboard shell + Overview tab
**Owns:** `apps/web/src/pages/user-dashboard-page/UserDashboard.jsx`, `dashboard/tabs/OverviewTab.jsx`
**Done when:** Profile header + stats row + tab nav + Overview content; tab state syncs to URL.
**Suggestions:** Stats row as `motion.div` cards counting up on mount (look up `useMotionValue` + `animate`). Keep accessible — `aria-live="polite"` on the count.

### T17 — Dashboard: Comparisons tab
**Owns:** `dashboard/tabs/{ComparisonsTab,ComparisonCard}.jsx`
**Note:** `useComparisonSets.js` has 9 direct apiClient calls (top of debt list). Out of scope to fix here unless you're also touching it — just don't add more.

### T18 — Dashboard: Comments tab
**Owns:** `dashboard/tabs/CommentsTab.jsx`

### T19 — Dashboard: Reviews tab
**Owns:** `dashboard/tabs/{ReviewsTab,ReviewCard}.jsx`

### T20 — Dashboard: Products tab
**Owns:** `dashboard/tabs/ProductsTab.jsx`

### T21 — Dashboard: Votes tab
**Owns:** `dashboard/tabs/VotesTab.jsx`
**Suggestions:** Group votes by comparison; show the user's pick vs. the consensus pick. `recharts` mini-sparklines work nicely as inline summaries.

### T22 — User profile page
**Owns:** `apps/web/src/pages/user-dashboard-page/UserProfile.jsx`
**Done when:** Public profile mirrors dashboard tabs but in read-only mode; "follow" CTA if/when that ships (don't build it if it doesn't exist server-side — see rule 2).
**Suggestions:** A subtle hero with the user's avatar centered, recent activity below. Use `Avatar` from `components/common/` (touched by T33).

### T23 — Create / Edit comparison flow
**Owns:** `apps/web/src/pages/user-dashboard-page/dashboard/tabs/{CreateComparison,AspectForm}.jsx`
**Routes:** `/new-comparison`, `/edit-comparison/:id`
**Done when:** 4-item picker, aspect input, preview, submit; feels like a multi-step wizard on mobile, single scrolling page on desktop.
**Suggestions:**
- Form state: lightweight `useReducer` is fine; bringing in `react-hook-form` is worth proposing if the form gets thorny.
- `zod` (installed, used by `@twirly/shared`) for client-side validation that matches the server schemas — single source of truth wins.
- Item search inline with `cmdk`-style results, or reuse T06's search bar.

### T24 — Onboarding flow
**Owns:** `apps/web/src/pages/onboarding/` (incl. `cats/`, `dd/`)
**Done when:** 3–4 steps (display name → categories → notifications → done); progress indicator; can't skip required fields; gracefully resumes if user reloads mid-flow.
**Suggestions:** `framer-motion` step transitions; `localStorage` to remember progress between reloads. Keep copy human and short.

### T25 — Settings: shell + drawer
**Owns:** `apps/web/src/pages/settings-page/Settings.jsx`
**Done when:** Sub-route shell (`/settings/*`); sidebar on desktop, drawer on mobile; active item highlight.
**Suggestions:** `react-router-dom@7` nested routes — let each tab own its own `Route`.

### T26 — Settings: Account + Profile + Security
**Owns:** `apps/web/src/pages/settings-page/tabs/{AccountSettings,ProfileSettings,SecuritySettings}.jsx`
**Note:** `ProfileSettings.jsx` has 5 direct apiClient calls — migrate to `services/users.js` while here.
**Suggestions:** `sonner` (installed) for save toasts. Inline validation per field with `zod`.

### T27 — Settings: Appearance + Notifications + Privacy
**Owns:** `tabs/{AppearanceSettings,NotificationsSettings,PrivacySettings}.jsx`
**Suggestions:**
- Appearance: theme picker is the showcase here — animated swatch + live preview tile. `react-colorful` (installed) only if user-custom themes are in scope (they're not per `project_ui_redesign_decisions` — three locked themes — but check before cutting it).
- Notifications: grouped toggle list with optimistic UI.

### T28 — Settings: Billing + Language + Help
**Owns:** `tabs/{BillingSettings,LanguageSettings,HelpSettings}.jsx`
**Suggestions:** Help page → searchable FAQ. Billing → if there's no real billing wired, keep it as a polished empty state, don't fake data.

### T29 — Feedback: modal + management
**Owns:** `apps/web/src/pages/feedback/{FeedbackModal,FloatingFeedbackButton}.jsx`, `feedback-page/FeedbackManagement.jsx`
**Suggestions:**
- Modal: replace any custom modal with the existing `components/common/Modal.jsx` (T33 polishes it).
- Floating button: `framer-motion` `drag` so users can move it out of the way.
- Management page (admin): table view with status chips; `sonner` for status-change toasts.

### T30 — Beta: Performance
**Owns:** `apps/web/src/pages/beta/BetaPerformance.jsx`
**Suggestions:** `recharts` time-series for FPS / latency. Low-priority dev surface — clean code matters more than visual polish here.

### T31 — Beta: Analytics
**Owns:** `apps/web/src/pages/beta/BetaAnalytics.jsx`
**Suggestions:** Same as T30.

### T32 — 404 / Not-found
**Owns:** `apps/web/src/components/NotFoundPage.jsx`
**Done when:** Themed, on-brand, suggests next actions (home, search, recent), not a sad blank page.
**Suggestions:** A small `lottie-react` animation (`lottie-react` is installed) or a tasteful `framer-motion` illustration. One line of copy beats a paragraph.

### T33 — Shared common components polish
**Owns:** `apps/web/src/components/common/{Avatar,Button,Modal,LoadingScreen,ErrorScreen,LoadingOrError,InitialLoadingScreen,PullToRefresh,BackgroundImage,LottieAnimation}.jsx`
**Caution:** These are used by *everyone*. Preserve exported props. If you change a prop name, you break every other task in flight.
**Done when:** Variants standardized (Button: primary/secondary/ghost/danger; sizes sm/md/lg); LoadingScreen + ErrorScreen consistent visual language; Modal supports backdrop + escape + focus trap.
**Suggestions:**
- `tailwind-merge` + `clsx` (both installed) make variant logic in `Button` clean: `cn(base, variants[variant], className)`.
- For Modal focus trap, `@radix-ui/react-dialog` would be a justified new dep (a11y is hard to get right by hand) — propose it before installing.
- Don't over-genericize. If a prop isn't used anywhere, drop it.

### T34 — Shared cards polish
**Owns:** `apps/web/src/components/common/common-cards/{ItemCard,TrendingCard}.jsx`, `comments/{Comment,CommentForm,CommentHeader,Reply}.jsx` (+ their `.css`)
**Caution:** Shared with T07, T08, T12, T17, T19, T22. Preserve props.
**Done when:** Cards have a single shared visual language (image, title, meta row, action chips); comment thread feels chat-native.
**Suggestions:** Port the `.css` files to Tailwind so the cards live in one file. `date-fns` `formatDistanceToNow` for "2h ago". Long-press to react on mobile (`framer-motion` `whileTap` + a timer) — only if it doesn't get in the way of scroll.

---

## Collision matrix (quick reference)

| If you're working on | Don't also touch | Why |
|---|---|---|
| Any task | T33, T34 in the same change | Shared components — let one worker own them |
| T07, T08, T12, T17, T19, T22 | `common/common-cards/`, `common/comments/` | Owned by T34 |
| Any task with toasts/modals/loading states | `common/Modal.jsx`, `common/LoadingScreen.jsx`, etc. | Owned by T33 |
| T16–T21 | `UserDashboard.jsx` shell beyond your tab | Shell is T16 |
| T25–T28 | `Settings.jsx` shell beyond your tab | Shell is T25 |
| T09–T12 | Each other's files | Compare flow split four ways on purpose |
| Any task | `MainRoutingPage.jsx`, `App.jsx`, contexts, `tailwind.config.js` | Global — talk to the user first |

## When two tasks must touch the same file

That's a sign the split is wrong. Stop, message the user, propose a re-split — don't paper over it with a merge.

---

## Worker onboarding prompt

Copy-paste this to each worker when assigning them. It's self-contained.

---

> You've been assigned to the **Twirly UI revamp**. Multiple workers are running in parallel on the same branch (`backend-add`). You all share one working tree — commits are **not** per task; the user will commit in big batches when they want. Your only coordination mechanism is the tracker file. Your job: pick one atomic task, lock it in the tracker, ship it cleanly, release it — without stepping on anyone else's toes.
>
> **Read these three files before you touch any code, in this order:**
>
> 1. `DESIGN_SYSTEM.md` — the riso-zine aesthetic, palette tokens (`t.bg`, `t.ink`, `t.red`, `t.blue`, `t.purple`, `t.mustard`, `t.blend`), three-font typography (DM Serif Display / Fraunces / Caveat), shared primitives in `src/components/riso/` (`PaperGrain`, `Halftone`, `HandUnderline`, `HandArrow`, `Tape`, `StarStamp`), motion patterns, layout conventions, copy principles. **This is the visual contract. Do not invent new visual language.**
> 2. `UI_REVAMP_TASKS.md` — the task tracker. Read the working rules at the top in full. They are not negotiable.
> 3. `CLAUDE.md` — repo conventions, dev commands, "Known debt" list. Note the global hands-off files.
>
> **Picking a task:**
>
> 1. **Re-read `UI_REVAMP_TASKS.md` fresh from disk** (don't trust a cached snapshot — other workers are editing it).
> 2. In the task index, find a row where **Status is `[ ]`**. Skip `[~]` (another worker owns it), `[x]` (done), and `[!]` (blocked).
> 3. Cross-check the **Collision matrix** at the bottom of that file. If your candidate task's files overlap a `[~]` row, pick a different task.
>
> **Lock it (this is the only coordination — get it right):**
>
> 1. Edit **only your chosen row** in the task index:
>    - `Status:  [ ] → [~]`
>    - `Owner:   — → @your-handle`
>    - `Started: — → YYYY-MM-DD HH:MM`
> 2. Save the file.
> 3. **Re-read the file once more from disk.** Confirm your claim is the only change to that row. If two workers raced and the row now shows someone else, back off and pick a different task. The tracker file is the lock; there is no git-level mechanism.
>
> Don't touch any other code until step 3 completes.
>
> **While working:**
>
> - Stay inside your task's "Owns" file list. If you need to reach outside, **stop and ask the user**.
> - **Code quality is the highest-order rule.** Clean, readable, idiomatic React. No fallback logic, no commented-out blocks, no "just in case" branches. Names describe intent. If you find dead code, delete it. Working-but-messy is a failed task.
> - Use only theme tokens for color. Use only the primitives in `src/components/riso/` plus what's already in `apps/web/package.json` (`framer-motion`, `lucide-react`, `sonner`, etc.). Do not add new deps without asking the user first.
> - `pnpm --filter @twirly/web lint` must pass at 0 errors / 0 warnings before you call it done.
> - `make dev`, open the app, click through your surface on mobile width (~390px) **and** desktop width. Lint and type-checks do not prove the feature works.
> - Don't touch the hands-off files listed in `UI_REVAMP_TASKS.md` rule 5. If you think you need to, stop and ask.
> - **You do not commit per task.** The user commits when they decide. Just keep the tree clean and lint-passing as you go. If the user explicitly asks you to checkpoint, prefix the message with the task ID(s) (`feat(ui): T07 + T08 — trending and search`); one commit can bundle multiple finished tasks.
> - Re-read the tracker periodically. Other workers' locks land asynchronously — staying current avoids accidental collisions.
>
> **Releasing the task:**
>
> 1. Re-read the tracker.
> 2. Edit your row: `[~] → [x]`, fill in `Finished: YYYY-MM-DD HH:MM`. Leave Owner set.
> 3. Save.
>
> A `[x]` row is frozen. If a regression surfaces later, it gets a new row at the bottom of the index, not a reopened one.
>
> **If you get stuck:** flip your row to `[!]`, put a one-line reason in the Notes column, leave Owner set to yourself. The user will see it and unblock you.
>
> **Don't hold more than two `[~]` rows at once.** Long-held locks block everyone else.
>
> **Summary in one line:** read the design system, lock a single `[ ]` task by editing the tracker row (re-read to confirm no race), do clean work that follows the visual contract, release the row when done, don't commit unless asked, never reach outside your task's files without asking.


