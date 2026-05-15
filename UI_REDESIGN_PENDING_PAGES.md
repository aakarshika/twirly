# UI Redesign — Pending Pages Audit

_Last updated: 2026-05-14_

Snapshot of which page surfaces have been touched by the redesign vs. which are still on the old design. Routes are drawn from `apps/web/src/pages/MainRoutingPage.jsx`. This is a **count + surface list only** — no per-page redesign notes here (intentional, per user direction).

## ✅ Done (2 surfaces)

| Surface | Route(s) | Key files |
|---|---|---|
| Marketing landing | `/landing`, `/` (logged-out) | `apps/web/src/pages/landing/LandingPage.jsx`, `apps/web/src/components/auth/Landing.jsx` |
| Auth | `/login`, `/signup`, `/forgot-password` | `apps/web/src/components/auth/{Login,Signup,ForgotPassword,TwirlingTwirlyLogo}.jsx` |

## ⏳ Pending (15 surfaces, ~50 page-level files)

### Primary app screens (7)

| # | Surface | Route(s) | Entry file |
|---|---|---|---|
| 1 | Trending / home feed (logged-in `/`) | `/` | `pages/trending-page/Trending.jsx` |
| 2 | Search | `/search` | `pages/search/search-page/SearchPage.jsx` |
| 3 | Compare / TikTokScroll | `/compare/:id/*` | `components/TikTokScroll.jsx` + `pages/compare-page/*` (8 files) + `pages/comparison-aspect-page/*` + `pages/comparison-results-page/*` |
| 4 | Product details (+ tabs) | `/item/:itemId`, `/item/:itemId/:tab` | `pages/product-details/ProductDetails.jsx` + `tabs/{AppearancesTab,CommentAppearancesTab,ReviewsTab,OtherChart}.jsx` |
| 5 | Activity | `/activity` | `pages/activity-page/ActivityPage.jsx` |
| 6 | User dashboard (+ tabs) | `/dashboard`, `/dashboard/:tab` | `pages/user-dashboard-page/UserDashboard.jsx` + `dashboard/tabs/{Overview,Comparisons,Comments,Products,Reviews,Votes}Tab.jsx` |
| 7 | User profile | `/user/:username`, `/user/:username/:tab` | `pages/user-dashboard-page/UserProfile.jsx` |

### Flows / modals (3)

| # | Surface | Route(s) | Entry file |
|---|---|---|---|
| 8 | Onboarding | `/onboarding` | `pages/onboarding/OnboardingFlow.jsx` (+ `cats/`, `dd/`) |
| 9 | Create / edit comparison | `/new-comparison`, `/edit-comparison/:id` | `pages/user-dashboard-page/dashboard/tabs/{CreateComparison,AspectForm,ComparisonCard,ReviewCard}.jsx` |
| 10 | Feedback | (modal + `/beta/feedback`) | `pages/feedback/{FeedbackModal,FloatingFeedbackButton}.jsx`, `feedback-page/FeedbackManagement.jsx` |

### Settings sub-pages (1 surface, 9 tabs)

| # | Surface | Route | Files |
|---|---|---|---|
| 11 | Settings (all tabs) | `/settings/*` | `pages/settings-page/Settings.jsx` + `tabs/{Account,Appearance,Billing,Help,Language,Notifications,Privacy,Profile,Security}Settings.jsx` (9) |

### Secondary / utility (4)

| # | Surface | Route | File |
|---|---|---|---|
| 12 | Not-found / 404 | `*` | `components/NotFoundPage.jsx` |
| 13 | Beta — performance | `/beta/performance` | `pages/beta/BetaPerformance.jsx` |
| 14 | Beta — analytics | `/beta/analytics` | `pages/beta/BetaAnalytics.jsx` |
| 15 | Error test (dev-only) | `/error-test` | `components/ErrorTest.jsx` |

## Tallies

- **Done:** 2 surfaces (landing, auth)
- **Pending:** 15 surfaces
- **Pending file count (page-level only):** ~50 `.jsx` files under `apps/web/src/pages/` + a handful in `components/` (TikTokScroll, NotFoundPage, ErrorTest)
- **Heaviest clusters:** Compare flow (~15 files across 3 folders), Dashboard tabs (10 files), Settings tabs (10 files), Product details (5 files)

## Notes / cross-references

- `UI_REDESIGN_PLAN.md §6 "Things deliberately deferred"` already calls out **search results**, **settings sub-pages**, and **onboarding** as out-of-scope for the original phased rollout. They're listed here because they remain on the old design regardless of the original scoping.
- `UI_REDESIGN_PLAN.md` Phase 2 (home/feed), Phase 3 (compare), Phase 4 (dashboard & profile) are the canonical home for surfaces 1, 3, 6, 7 above — i.e., the original plan acknowledges these are unfinished.
- Beta + ErrorTest + 404 are utility/dev surfaces — low priority but listed for completeness.
- This file is a count, not a plan. Sequencing belongs in `UI_REDESIGN_PLAN.md` / `SPRINT_TRACKER.md` when work resumes.
