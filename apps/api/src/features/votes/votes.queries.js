import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

/** Load a vote by id — used by requireOwner. Returns { userId, ... } or null. */
export async function getVoteById(id) {
  const { rows } = await db.execute(sql`
    SELECT id, user_id AS "userId", set_id, item_id, created_at
    FROM votes WHERE id = ${id} LIMIT 1
  `);
  return rows[0] ?? null;
}

/** Check whether a user has voted on a set. Returns the vote row or null. */
export async function getVoteForSet(userId, setId) {
  const { rows } = await db.execute(sql`
    SELECT id, user_id, set_id, item_id, created_at
    FROM votes WHERE user_id = ${userId} AND set_id = ${setId} LIMIT 1
  `);
  return rows[0] ?? null;
}

/** All votes cast by a user, enriched with set + item info. */
export async function getUserVotes(userId) {
  const { rows } = await db.execute(sql`
    SELECT
      v.id,
      v.created_at,
      cs.name                            AS title,
      i.name                             AS voted_for,
      COALESCE(cat.name, 'Uncategorized') AS category
    FROM votes v
    JOIN comparison_sets cs ON cs.id = v.set_id
    JOIN items            i  ON i.id  = v.item_id
    LEFT JOIN categories cat ON cat.id = cs.category_id
    WHERE v.user_id = ${userId}
    ORDER BY v.created_at DESC
  `);
  return rows;
}

/** Count of votes for a specific item in a set. */
export async function getVoteCount(setId, itemId) {
  const { rows } = await db.execute(sql`
    SELECT COUNT(*)::int AS count FROM votes
    WHERE set_id = ${setId} AND item_id = ${itemId}
  `);
  return rows[0]?.count ?? 0;
}

/** Insert a new vote and return the created row. */
export async function castVote({ userId, setId, itemId }) {
  const { rows } = await db.execute(sql`
    INSERT INTO votes (user_id, set_id, item_id) VALUES (${userId}, ${setId}, ${itemId})
    RETURNING *
  `);
  return rows[0];
}

/** Change which item was voted for. Returns updated row or null. */
export async function updateVote(id, itemId) {
  const { rows } = await db.execute(sql`
    UPDATE votes SET item_id = ${itemId} WHERE id = ${id} RETURNING *
  `);
  return rows[0] ?? null;
}

/** Delete a vote by id. Returns deleted row or null. */
export async function revertVote(id) {
  const { rows } = await db.execute(sql`
    DELETE FROM votes WHERE id = ${id} RETURNING *
  `);
  return rows[0] ?? null;
}

/** Delete vote by userId + setId (no id needed). Returns deleted row or null. */
export async function revertVoteBySetId(userId, setId) {
  const { rows } = await db.execute(sql`
    DELETE FROM votes WHERE user_id = ${userId} AND set_id = ${setId} RETURNING *
  `);
  return rows[0] ?? null;
}
