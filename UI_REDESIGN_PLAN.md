# Twirly — UI Redesign Plan

**Status:** Discovery complete, ready to implement Phase 0.
**Scope:** Full frontend redesign (mobile-first, native-app priority via Capacitor).
**Out of scope:** Backend / Supabase / PLpgSQL changes — see `REFACTOR_PLAN.md`.

---

## 1. Context

Twirly is a comparison/voting app shipped three ways from one React codebase:
- **Web** (Vercel — twirlyapp.com)
- **iOS** (Capacitor 7 → WKWebView)
- **Android** (Capacitor 7 → Android WebView)

Stack: React 18 (JSX), Vite, TailwindCSS, CSS variables, react-router 7, framer-motion, lucide-react, Supabase.

Mobile-first means design must respect: safe-area insets top + bottom, ≥44px touch targets, no hover-only affordances, Android hardware-back, status bar overlay behavior.

---

## 2. Findings from discovery

These are the issues this plan exists to fix.

- **Trending page is a stub.** `src/pages/trending-page/Trending.jsx` auto-redirects to `/compare/:firstFeed` on mount; the grid layout is commented out. There is no real home/discover view.
- **TikTokScroll is the centerpiece.** `src/components/TikTokScroll.jsx` (539 lines, framer-motion) handles voting, comments, and category navigation as a vertical-swipe feed. It is the app's primary surface.
- **Themes are broken, not just inconsistent.** `ThemeContext.jsx` defines 8 themes; `pastel` (light yellow bg + light green text) and `retro` (green bg + pink text) fail WCAG contrast outright.
- **Theme token usage is mixed.** Some components use Tailwind tokens (`bg-background`, `text-foreground`), most use inline `style={{ color: 'var(--color-text)' }}`, and the bottom tab bar (`Header.jsx:827`) hardcodes `bg-gray-100`, breaking every theme.
- **Two conflicting CSS files.** `src/styles/global.css` (light defaults) and `src/styles/globals.css` (dark defaults) both define `:root` and `body` styles. `src/index.css` still has `--background-color: red` placeholder.
- **Tailwind config doesn't match ThemeContext defaults.** `tailwind.config.js:12-14` declares black bg / white fg / blue primary; `ThemeContext.jsx` defaults to the Light theme. Two sources of truth.
- **Mobile chrome quirks.** Bottom tab bar hardcoded gray, "tiny header" has no page title, swipe-back is commented out (`MainRoutingPage.jsx:129`), Android hardware-back not wired to drawer/modals.
- **Status bar mismatch.** `App.jsx:22` forces `Style.Light` (light icons) even on light themes — icons disappear on white backgrounds in iOS.

---

## 3. Locked decisions

| Decision | Choice |
| --- | --- |
| Priority surface | Mobile-first (native app via Capacitor) |
| Scope | Full redesign — home, compare, dashboard, chrome |
| Theming cleanup | Inline as we touch each file |
| Theme count | Cut from 8 → **3**: Light, Dark, Ocean (accent) |
| Default theme | Follow system (`prefers-color-scheme`), user can override |
| Status bar | Edge-to-edge, **theme-aware** (icon style flips with theme) |
| Home screen | **Real feed landing** — restore Trending grid, tap card → scroller |
| Larger screens | Adaptive: phone <768 → phone-column on tablet 768–1023 → desktop side-panel ≥1024 |

---

## 4. Foundations: design system

### 4.1 Semantic token roles

All themes resolve to the same token set. Components consume tokens by role, never by theme.

**Color roles**
- `bg` — page background
- `surface` — cards, panels, drawers
- `surface-elevated` — hovered/active surface, modals
- `text` — primary text
- `text-muted` — secondary text, captions
- `text-inverse` — text on primary-colored fills
- `border` — dividers, default borders
- `border-strong` — focused/active borders
- `primary` — brand accent, primary CTAs
- `primary-fg` — text/icon on primary fills
- `success` / `warning` / `danger` — semantic states
- `overlay` — modal backdrop, scrim

**Scales**
- Spacing: `0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16` (× 4px base = 0px → 64px)
- Radius: `sm 6 / md 10 / lg 16 / xl 24 / full`
- Elevation: `0 / sm / md / lg` (subtle, mobile-appropriate — no aggressive drop shadows)
- Type scale: `12 / 13 / 14 / 16 / 18 / 20 / 24 / 30 / 36` with weights `400 / 500 / 600 / 700`

### 4.2 Three themes

**Light**
- `bg #FFFFFF`, `surface #F7F8FA`, `surface-elevated #FFFFFF`
- `text #0F172A`, `text-muted #475569`, `text-inverse #FFFFFF`
- `border #E2E8F0`, `border-strong #CBD5E1`
- `primary #2563EB`, `primary-fg #FFFFFF`
- `overlay rgba(15, 23, 42, 0.5)`

**Dark**
- `bg #0B0F17`, `surface #11161F`, `surface-elevated #1A2030`
- `text #F8FAFC`, `text-muted #94A3B8`, `text-inverse #0B0F17`
- `border #1F2937`, `border-strong #334155`
- `primary #60A5FA`, `primary-fg #0B0F17`
- `overlay rgba(0, 0, 0, 0.6)`

**Ocean (accent)**
- `bg #F0F9FF`, `surface #E0F2FE`, `surface-elevated #FFFFFF`
- `text #0C4A6E`, `text-muted #0369A1`, `text-inverse #FFFFFF`
- `border #BAE6FD`, `border-strong #7DD3FC`
- `primary #06B6D4`, `primary-fg #FFFFFF`
- `overlay rgba(12, 74, 110, 0.5)`

All combinations target WCAG AA (4.5:1 for body, 3:1 for large text). Will be verified before Phase 0 ships.

### 4.3 Single source of truth

- Tokens live in **`tailwind.config.js`** under `theme.extend.colors` with semantic names.
- Theme switching writes the same names to `:root` CSS custom properties via `ThemeContext`.
- Delete `src/styles/global.css` (light defaults) and `src/index.css` placeholder.
- Keep `src/styles/globals.css` as the single base stylesheet; rewrite it to consume tokens.
- Components import nothing color-related; they use Tailwind classes (`bg-bg text-text border-border`).

---

## 5. Phased rollout

Each phase is independently shippable and visible to users.

### Phase 0 — Foundations
**Goal:** Token system live; theme switching uses new model; 3 themes pass contrast.

**Files**
- `tailwind.config.js` — rewrite color palette to semantic tokens
- `src/contexts/ThemeContext.jsx` — reduce to 3 themes, emit new token names, add `prefers-color-scheme` detection
- `src/styles/globals.css` — rewrite base styles against tokens; remove duplicates
- `src/styles/global.css` — **delete**
- `src/index.css` — **delete** (`--background-color: red` placeholder)
- `src/App.jsx` — status bar style now reads from active theme

**Success criteria**
- Switching themes in DevTools changes every surface
- No `bg-gray-*` or hex literals remain in shared chrome (`Header`, `Footer`, layout)
- Status bar icons remain visible in iOS simulator across all 3 themes
- Lighthouse contrast audit passes on Trending and a Compare screen

### Phase 1 — Chrome (header, nav, drawer, bottom tab)
**Goal:** App-wide navigation feels native and theme-aware.

**Mobile (<768)**
- Redesign bottom tab bar: 5 items max, theme-aware bg + active indicator, 56px tall + safe-area bottom padding
- Redesign top bar: contextual title, back button, page-level actions (replaces title-less "tiny header")
- Settings drawer: redesigned with the same token model; wire Android hardware-back via `@capacitor/app`'s `backButton` listener to close drawer before navigating
- Re-evaluate the commented-out swipe-back gesture (`MainRoutingPage.jsx:129`) — decide keep or remove

**Tablet (768–1023)**
- Constrain main content to a centered ~480px column; mobile chrome unchanged
- Same bottom tab bar and top bar

**Desktop (≥1024)**
- Redesigned side panel: collapsible, theme-aware, profile card at top
- Top header: logo, search, primary CTA
- No bottom tab bar

**Files**
- `src/components/layout/Header.jsx` (split into smaller components: `TopBar`, `BottomTabs`, `SideNav`, `MobileDrawer`)
- `src/components/layout/Footer.jsx`
- `src/pages/MainRoutingPage.jsx` — adjust `md:pl-60` offsets for new breakpoints
- New: `src/components/layout/TopBar.jsx`, `BottomTabs.jsx`, `SideNav.jsx`, `MobileDrawer.jsx`

**Success criteria**
- Touch target audit: every tappable chrome element ≥44px
- Drawer closes via Android hardware-back without exiting the app
- No layout shift on theme switch
- Bottom tab bar respects iOS home-indicator safe area

### Phase 2 — Home: real feed landing
**Goal:** Tapping a comparison card opens the scroller; the home screen is its own surface.

**Behavior**
- `Trending.jsx` no longer auto-redirects
- Category filter chips at top (horizontal scroll, mobile-first)
- Comparison preview card: N-item grid (default 4) with images/labels, vote counts, creator avatar/name, category
- Pull-to-refresh
- Empty / loading / error states
- Card tap → `navigate('/compare/:id')` opens scroller starting at that comparison

**Files**
- `src/pages/trending-page/Trending.jsx` — rebuild as a real screen
- `src/components/common/common-cards/TrendingCard.jsx` — redesign
- `src/components/common/common-cards/TrendingCardCommon.jsx` — redesign or consolidate
- `src/contexts/TrendingContext.jsx` — verify hooks support the new view (no logic changes expected)

**Success criteria**
- New users land on a discover-style grid, not directly into a swipe scroller
- Card → scroller transition is < 300ms perceived
- Empty state has a clear "Create a comparison" CTA

### Phase 3 — Compare / TikTokScroll redesign
**Goal:** Polish the centerpiece. Voting feels confident; comments are accessible; results are clear.

**Behavior**
- Card structure: creator strip → media → A/B vote affordances → results bar → comments toggle
- Vote affordances at thumb-zone height, theme-aware, with haptic-ish micro-animation
- Comments collapse/expand with a clear handle; safe-area-aware
- Vote bar sits above iOS home indicator
- Theme-aware overlay gradient at top (don't fight the status bar)

**Files**
- `src/components/TikTokScroll.jsx` — restructure (consider splitting into `ScrollContainer` + `ComparisonCard`)
- `src/pages/compare-page/Heading.jsx`
- `src/pages/compare-page/Grid.jsx`
- `src/pages/compare-page/AllComments.jsx`
- `src/pages/compare-page/CompareButtons.jsx`
- `src/pages/comparison-results-page/*` (ComparisonCirclesView, ComparisonCircle, CenterStage)

**Success criteria**
- Smooth 60fps swipe on iPhone 12-class device
- Vote → result animation reads in <500ms
- All voting/comment surfaces respect both safe areas
- Works in all 3 themes without specialcasing

### Phase 4 — Dashboard & profile
**Goal:** A clear identity surface and clear ownership of created/voted content.

**Behavior**
- Profile header: avatar, display name, @username, member-since, follower/following counts
- Tabs: Your Comparisons / Your Votes / Followers (or whatever the existing tab model is)
- Empty state per tab with clear next-action CTA
- "Create Comparison" entry from dashboard

**Files**
- `src/pages/user-dashboard-page/UserDashboard.jsx`
- `src/pages/user-dashboard-page/UserProfile.jsx`
- `src/pages/user-dashboard-page/dashboard/*` (whatever the tabs are)
- `src/pages/user-dashboard-page/dashboard/tabs/CreateComparison.jsx`

**Success criteria**
- Tab switching ≤150ms
- Empty states never look like errors
- Profile editing flow tested end-to-end

### Phase 5 — QA & native polish
**Goal:** Ship-ready.

- Visual QA matrix: 3 themes × {phone, tablet, desktop} × {iOS, Android, web}
- Real-device test: iPhone (notch + dynamic island), iPhone SE (small), Pixel, low-end Android
- Contrast audit (WCAG AA minimum)
- `prefers-reduced-motion` respected in framer-motion transitions
- Screen-reader sanity check on Trending, Compare, Dashboard
- Sentry breadcrumbs preserved through redesign

---

## 6. Things deliberately deferred

- A new accent theme beyond Ocean (revisit after launch)
- Search UI redesign — Phase 1 chrome covers the entry point only; search results are a later pass
- Settings sub-pages (Profile / Appearance / Billing / etc.) — they get token cleanup in Phase 1 but visual redesign is deferred
- Onboarding flow redesign — separate effort, not in scope
- New animations beyond what's needed for the redesigned surfaces

---

## 7. Open questions to resolve before Phase 0

- Confirm the **5 mobile bottom-tab items**: currently Home / Search / Create / Profile (4) — propose adding a fifth (Notifications? Categories?) or keeping 4 with more breathing room
- Logo treatment: keep current `public_logo_transparent.png`, or redesign as part of this work?
- Are there any pages outside the four target areas (onboarding, search, product-details, feedback) that need to be touched in Phase 0/1 because of token migration, even if visual redesign is deferred? Likely yes — at minimum, every page using `var(--color-*)` will need migration.

---

## 8. Implementation note

When this plan moves into execution, each phase opens with a `TaskCreate` batch tied to the success criteria in that phase. Sub-tasks track concrete file edits. We work one phase at a time and ship before starting the next.
