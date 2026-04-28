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
| Frontend | React, JavaScript, Vite, TailwindCSS |
| Backend / DB | Supabase (PostgreSQL + PLpgSQL) |
| Auth | Supabase Auth (email/password, session management) |
| Mobile | Capacitor (iOS + Android) |
| Deployment | Vercel |

> The database layer carries significant business logic — stored procedures and functions handle voting integrity, comparison ranking, and real-time result computation directly in PLpgSQL. This keeps the client thin and prevents result manipulation from the frontend.

---

## Architecture

src/
├── components/     # Reusable UI — themed, responsive
├── contexts/       # React Context: auth, theme
├── hooks/          # Custom hooks for data fetching and state
├── pages/          # Route-level components
├── services/       # Supabase client calls, abstracted per domain
├── utils/          # Shared helpers
└── lib/            # Third-party configs (Supabase client, etc.)


**Theming** — all colors are driven by a theme token system via React Context. Components never hardcode colors. Switching themes is a single state change that cascades across the entire UI.

**Auth** — Supabase session is managed globally via `AuthContext`. Protected routes wrap sensitive pages. All API calls go through the service layer, never directly from components.

---

## Local Setup

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Add your Supabase project URL and anon key

# Start dev server
npm run dev
```

For Supabase setup (tables, RLS policies, stored procedures): see `SUPABASE_SETUP.md`

For deploying to iOS/Android via Capacitor: see `DEPLOYMENT.md`

---

## Design decisions worth noting

**Heavy DB logic in PLpgSQL** — voting integrity, deduplication, and ranking are handled at the database layer via stored procedures. This means a compromised or modified frontend cannot skew results — the source of truth lives in the DB.

**Theme system as first-class feature** — rather than a cosmetic toggle, the theme system is architecturally built in. Every UI component reads from the theme context. Adding a new theme means adding one token object — no component changes needed.

**Capacitor for mobile** — same React codebase ships to web, iOS, and Android. Safe area insets and touch interactions are handled at the component level to ensure native feel across platforms.

---

## Status

Live and deployed at [twirlyapp.com](https://twirlyapp.com). Beta testing in progress — see `BETA_TESTING.md` for the current testing scope and known issues.
