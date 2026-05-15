/**
 * Twirly dev seed — orchestrator.
 *
 * All personas share the same password: Seed1234!
 *
 *   alex@twirly.dev    — The Creator      (owns 3 sets, broad activity)
 *   jordan@twirly.dev  — The Power Voter  (votes on everything, owns 1)
 *   priya@twirly.dev   — The Commenter    (long comment threads, owns 2)
 *   marcus@twirly.dev  — The Reviewer     (detailed item reviews, owns 1)
 *   sam@twirly.dev     — The Newbie       (1 vote, no comparisons — empty-state testing)
 *   riley@twirly.dev   — The Contrarian   (always votes for the underdog, owns 1)
 *
 * Run from repo root: pnpm run seed
 *
 * Adding new data?
 *   - New items/comparisons/votes/comments/reviews → edit the file in data/
 *   - New table/domain                             → add a file in seeders/ + wire it below
 *
 * Idempotent — wipes previous persona data before rebuilding.
 * Requires: Postgres up (docker compose up -d) + API running (pnpm run dev:api).
 */

import { pool } from './db.js';
import { PERSONAS, CATEGORIES, SHARED_PASSWORD } from './data/personas.js';
import { ITEMS }       from './data/items.js';
import { COMPARISONS } from './data/comparisons.js';
import { VOTES, COMMENTS, REVIEWS } from './data/interactions.js';

import { wipePreviousPersonaData, createUserViaApi, insertUserPreferences, applyCategoryPreferences } from './seeders/users.js';
import { seedCategories, seedItems }   from './seeders/catalog.js';
import { seedComparisons }             from './seeders/comparisons.js';
import { seedVotes, seedComments, seedReviews } from './seeders/interactions.js';

async function main() {
  console.log('\n🌱  Twirly seed starting…\n');

  console.log('0. Wiping previous persona data + seed items');
  await wipePreviousPersonaData(ITEMS.map(i => i.name));

  console.log('\n1. Personas (creating auth users via Better Auth API)');
  const userIds = {};
  for (const persona of PERSONAS) {
    userIds[persona.key] = await createUserViaApi(persona);
  }

  console.log('\n2. Categories');
  const catIds = await seedCategories(CATEGORIES);
  console.log(`  ${Object.keys(catIds).length} categories`);

  console.log('\n3. User preferences + notifications');
  for (const persona of PERSONAS) {
    await insertUserPreferences(userIds[persona.key], persona);
  }
  console.log(`  ${PERSONAS.length} persona preference rows written`);

  console.log('\n4. User category preferences');
  for (const persona of PERSONAS) {
    await applyCategoryPreferences(userIds[persona.key], persona, catIds);
  }

  console.log('\n5. Items');
  const itemIds = await seedItems(ITEMS, catIds);
  console.log(`  ${Object.keys(itemIds).length} items`);

  console.log('\n6. Comparisons (with items + aspects)');
  const setIds = await seedComparisons(COMPARISONS, catIds, itemIds, userIds);

  console.log('\n7. Votes');
  await seedVotes(VOTES, setIds, itemIds, userIds);

  console.log('\n8. Comments');
  await seedComments(COMMENTS, setIds, userIds);

  console.log('\n9. Reviews');
  await seedReviews(REVIEWS, itemIds, userIds);

  await pool.end();

  console.log('\n✅  Seed complete!\n');
  console.log(`  Shared password: ${SHARED_PASSWORD}\n`);
  for (const p of PERSONAS) {
    console.log(`    ${p.email.padEnd(22)} — ${p.displayName}`);
  }
  console.log('\n  Frontend: http://localhost:5734\n');
}

main().catch(err => {
  console.error('\n❌  Seed failed:', err.message);
  process.exit(1);
});
