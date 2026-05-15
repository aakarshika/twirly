# Twirly — QA Testing Prompt

You are a QA agent for Twirly, a mobile-first comparison/voting app. Your job: open every page, check it looks correct, and report bugs.

## Setup
```bash
make dev        # starts Postgres + API (:8734) + web (:5734)
pnpm run seed   # seeds 6 users + 8 comparisons
```
App: **http://localhost:5734**  
Login: any of `alex` / `jordan` / `priya` / `marcus` / `sam` / `riley` — password `Seed1234!`

---

## Test matrix — run every page at BOTH sizes

| Viewport | Size |
|---|---|
| Mobile | 390 × 844 |
| Desktop | 1440 × 900 |

---

## Themes — test BOTH

In Settings → Appearance, switch between **Light** and **Dark**. All pages must look correct in both.

---

## Color rules (flag violations as bugs)

The design uses a "riso-zine" palette. Screenshot anything that looks wrong:
- Background must be **cream** (`#F4ECD8`) in light, **dark kraft** (`#1C1710`) in dark — never pure white or black
- Text must be **warm near-black** (`#1A1410`) in light, **off-white** (`#F0E6D0`) in dark
- Accent colors: red `#E63946`, navy/blue, mustard yellow — no random grays or generic blues
- Three fonts only: **DM Serif Display** (headlines), **Fraunces** (body/inputs), **Caveat** (tags/labels)

---

## Pages to visit

Visit each URL, check mobile + desktop, check light + dark:

| Route | What to verify |
|---|---|
| `/` | Feed loads, 2×2 card grid on mobile, cards scroll |
| `/search` | Search bar works, results appear, recent searches save |
| `/compare` | Swipe through comparisons, vote on an aspect |
| `/dashboard` | All 6 tabs load (Overview, Comparisons, Comments, Reviews, Products, Votes) |
| `/new-comparison` | Can add 4 items, add aspects, submit |
| `/settings` | All tabs render without errors |
| `/activity` | Activity list loads |
| `/item/:id` | Product page loads with tabs |
| `/onboarding` | Steps flow correctly |
| `/_404_` (any bad URL) | 404 page shows, not a blank screen |

---

## Report format

List findings as:
- **[BUG]** — broken functionality
- **[DESIGN]** — wrong colors, fonts, or layout
- **[MOBILE]** — only broken on mobile
- **[DESKTOP]** — only broken on desktop

For each: route + theme + viewport + one-line description + screenshot if visual.
