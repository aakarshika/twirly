import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

/**
 * Builds the shared CTE + SELECT for set queries.
 * When userId is provided the result includes has_voted, voted_item_id, and vote_id
 * for the calling user.  Per-item vote counts are always included in the items array.
 */
function buildSetQuery(userId) {
  const userVoteCte = userId ? sql`,
    user_vote AS (
      SELECT id AS vote_id, set_id, item_id AS voted_item_id
      FROM votes WHERE user_id = ${userId}
    )` : sql``;

  const userVoteFields = userId ? sql`
    uv.vote_id,
    uv.voted_item_id,
    (uv.voted_item_id IS NOT NULL) AS has_voted,` : sql`
    NULL::int  AS vote_id,
    NULL::int  AS voted_item_id,
    FALSE      AS has_voted,`;

  const userVoteJoin = userId
    ? sql`LEFT JOIN user_vote uv ON uv.set_id = cs.id`
    : sql``;

  return sql`
    WITH vote_counts AS (
      SELECT set_id, COUNT(*) AS total_votes
      FROM votes
      GROUP BY set_id
    ),
    comment_counts AS (
      SELECT set_id, COUNT(*) AS total_comments
      FROM comparison_set_comments
      GROUP BY set_id
    ),
    item_vote_counts AS (
      SELECT set_id, item_id, COUNT(*) AS vote_count
      FROM votes
      GROUP BY set_id, item_id
    ),
    set_items AS (
      SELECT
        csi.set_id,
        json_agg(
          json_build_object(
            'id',                i.id,
            'name',              i.name,
            'image_url',         i.image_url,
            'item_color_string', i.item_color_string,
            'votes',             COALESCE(ivc.vote_count, 0)
          ) ORDER BY csi.id
        ) AS items
      FROM comparison_set_items csi
      JOIN items i ON i.id = csi.item_id
      LEFT JOIN item_vote_counts ivc
             ON ivc.item_id = csi.item_id AND ivc.set_id = csi.set_id
      GROUP BY csi.set_id
    )
    ${userVoteCte}
    SELECT
      ${userVoteFields}
      cs.id                               AS set_id,
      cs.name                             AS set_name,
      cs.created_at,
      cs.end_date,
      cs.category_id,
      cat.name                            AS category_name,
      up.display_name                     AS creator_display_name,
      up.profile_image_url                AS creator_image_url,
      up.username                         AS creator_username,
      COALESCE(vc.total_votes, 0)::int    AS total_votes,
      COALESCE(cc.total_comments, 0)::int AS total_comments,
      COALESCE(si.items, '[]'::json)      AS items
    FROM comparison_sets cs
    LEFT JOIN categories        cat ON cat.id     = cs.category_id
    LEFT JOIN user_preferences  up  ON up.user_id  = cs.user_id
    LEFT JOIN vote_counts       vc  ON vc.set_id   = cs.id
    LEFT JOIN comment_counts    cc  ON cc.set_id   = cs.id
    LEFT JOIN set_items         si  ON si.set_id   = cs.id
    ${userVoteJoin}
    WHERE cs.is_published = TRUE
  `;
}

/** Top trending sets ordered by vote count then recency. */
export async function getTrendingSets({ userId, limit = 20 } = {}) {
  const base = buildSetQuery(userId || null);
  const { rows } = await db.execute(sql`
    ${base}
    ORDER BY total_votes DESC NULLS LAST, cs.created_at DESC
    LIMIT ${limit}
  `);
  return rows;
}

/** Filtered sets — supports category filter and optional exclude-voted. */
export async function getFilteredSets({ userId, categoryId, excludeVoted = false, limit = 20 } = {}) {
  const base = buildSetQuery(userId || null);

  const categoryClause = categoryId
    ? sql`AND cs.category_id = ${categoryId}`
    : sql``;

  const votedClause = excludeVoted && userId
    ? sql`AND NOT EXISTS (SELECT 1 FROM votes WHERE set_id = cs.id AND user_id = ${userId})`
    : sql``;

  const { rows } = await db.execute(sql`
    ${base}
    ${categoryClause}
    ${votedClause}
    ORDER BY total_votes DESC NULLS LAST, cs.created_at DESC
    LIMIT ${limit}
  `);
  return rows;
}

/** Single set by id, optionally enriched with calling-user vote status. */
export async function getSetById(id, userId = null) {
  const base = buildSetQuery(userId);
  const { rows } = await db.execute(sql`
    ${base}
    AND cs.id = ${id}
    LIMIT 1
  `);
  return rows[0] ?? null;
}
