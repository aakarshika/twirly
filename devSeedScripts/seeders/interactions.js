import { q } from '../db.js';

export async function seedVotes(VOTES, setIds, itemIds, userIds) {
  let inserted = 0;
  for (const { set, votes } of VOTES) {
    const setId = setIds[set];
    if (!setId) { console.warn(`  SKIP votes — no setId for: ${set}`); continue; }
    for (const [personaKey, itemName] of votes) {
      const userId = userIds[personaKey];
      const itemId = itemIds[itemName];
      if (!userId || !itemId) {
        console.warn(`  SKIP vote — missing ${!userId ? 'user' : 'item'} for ${personaKey}/${itemName}`);
        continue;
      }
      await q(`INSERT INTO votes (user_id, item_id, set_id) VALUES ($1, $2, $3)`, [userId, itemId, setId]);
      inserted++;
    }
  }
  console.log(`  inserted ${inserted} votes`);
}

export async function seedComments(COMMENTS, setIds, userIds) {
  let inserted = 0;
  for (const c of COMMENTS) {
    const setId = setIds[c.set];
    const userId = userIds[c.by];
    if (!setId || !userId) {
      console.warn(`  SKIP comment — missing ${!setId ? 'set' : 'user'}: ${c.set} / ${c.by}`);
      continue;
    }
    await q(
      `INSERT INTO comparison_set_comments (set_id, user_id, content) VALUES ($1, $2, $3)`,
      [setId, userId, c.text],
    );
    inserted++;
  }
  console.log(`  inserted ${inserted} comments`);
}

export async function seedReviews(REVIEWS, itemIds, userIds) {
  let inserted = 0;
  for (const r of REVIEWS) {
    const itemId = itemIds[r.item];
    const userId = userIds[r.by];
    if (!itemId || !userId) {
      console.warn(`  SKIP review — missing ${!itemId ? 'item' : 'user'}: ${r.item} / ${r.by}`);
      continue;
    }
    await q(
      `INSERT INTO reviews (user_id, item_id, text, likes) VALUES ($1, $2, $3, $4)`,
      [userId, itemId, r.text, r.likes],
    );
    inserted++;
  }
  console.log(`  inserted ${inserted} reviews`);
}
