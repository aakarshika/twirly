# devSeedScripts

Local-dev only. Not run in CI, not shipped to production.

## What's here

| File | Purpose |
|---|---|
| `seed.js` | Populates a local Postgres with 6 user personas, 8 comparisons, votes, comments, and reviews. Idempotent. |
| `setup-db.sh` | Placeholder for applying static SQL objects (views, functions). Currently a no-op. |

## Running the seed

```bash
# 1. Postgres running locally
docker compose up -d

# 2. Server running (signup goes through Better Auth API)
npm run dev:server

# 3. In another terminal, from repo root:
npm run seed
```

The script auto-loads `server/.env` for `DATABASE_URL` and `BETTER_AUTH_URL`. It's idempotent — running it twice creates no duplicates.

## The 6 personas (all share password `Seed1234!`)

```
┌───────────────────┬─────────────────┬──────┬───────┬──────────┬─────────┐
│       Email       │    Archetype    │ Owns │ Votes │ Comments │ Reviews │
├───────────────────┼─────────────────┼──────┼───────┼──────────┼─────────┤
│ alex@twirly.dev   │ The Creator     │    3 │     8 │        3 │       2 │
├───────────────────┼─────────────────┼──────┼───────┼──────────┼─────────┤
│ jordan@twirly.dev │ The Power Voter │    1 │     8 │        2 │       0 │
├───────────────────┼─────────────────┼──────┼───────┼──────────┼─────────┤
│ priya@twirly.dev  │ The Commenter   │    2 │     6 │        6 │       1 │
├───────────────────┼─────────────────┼──────┼───────┼──────────┼─────────┤
│ marcus@twirly.dev │ The Reviewer    │    1 │     6 │        1 │       3 │
├───────────────────┼─────────────────┼──────┼───────┼──────────┼─────────┤
│ sam@twirly.dev    │ The Newbie      │    0 │     1 │        0 │       0 │
├───────────────────┼─────────────────┼──────┼───────┼──────────┼─────────┤
│ riley@twirly.dev  │ The Contrarian  │    1 │     8 │        2 │       1 │
└───────────────────┴─────────────────┴──────┴───────┴──────────┴─────────┘
```

### Why these personas

Each archetype exercises a different slice of the app:

- **Alex** — broad activity, useful as the "default" login for general testing.
- **Jordan** — maxed-out vote count, useful for testing vote dashboards, "voted on" filters, and the activity feed under load.
- **Priya** — long, thoughtful comment threads on multiple comparisons. Tests comment pagination, reply UI, and the commenter's profile view.
- **Marcus** — heavy item reviews (3 on tech/audio). Tests review surfaces on the product-details page.
- **Sam** — minimal activity. Tests onboarding flow, empty dashboard, empty activity feed, "no comparisons yet" empty states.
- **Riley** — votes for the underdog on every comparison. Two of the eight comparisons (Starbucks/Dunkin', Zara/H&M) end up tied 2-2, which exercises tied-result UI.

### Designed vote outcomes

| Comparison | Result |
|---|---|
| iPhone 15 Pro vs Galaxy S24 Ultra | iPhone wins 4-2 |
| AirPods Pro 2 vs Sony WH-1000XM5 | Sony wins 3-2 |
| Coca-Cola vs Pepsi | Coke wins 3-2 |
| Starbucks vs Dunkin' | **TIE 2-2** |
| Netflix vs Disney+ | Netflix wins 3-2 |
| Spotify vs Apple Music | Spotify wins 3-2 |
| Nike Air Max 270 vs Adidas Ultraboost 23 | Adidas wins 4-2 |
| Zara vs H&M | **TIE 2-2** |

## Adding to the seed

Edit `seed.js` directly — all data lives at the top of the file as plain JS objects, grouped by domain (`PERSONAS`, `CATEGORIES`, `ITEMS`, `COMPARISONS`, `VOTES`, `COMMENTS`, `REVIEWS`). The DB-writing helpers below are domain-by-domain and idempotent on natural keys (e.g. votes dedupe on `(user_id, set_id)`, comments on `(user_id, set_id, content)`).

If you add a comparison, reference items by **exact `name`** as they appear in `ITEMS`, and reference the owner by persona `key`. The seeder will warn-and-skip any row with an unresolved name rather than crashing.
