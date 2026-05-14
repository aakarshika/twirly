import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

// Shared CTE + SELECT used by both trending and filtered queries.
// Returns one row per set with aggregated items JSON, vote/comment counts, and creator info.
const BASE_SELECT = sql`
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
  set_items AS (
    SELECT
      csi.set_id,
      json_agg(
        json_build_object(
          'id',               i.id,
          'name',             i.name,
          'image_url',        i.image_url,
          'item_color_string', i.item_color_string
        ) ORDER BY csi.id
      ) AS items
    FROM comparison_set_items csi
    JOIN items i ON i.id = csi.item_id
    GROUP BY csi.set_id
  )
  SELECT
    cs.id                        AS set_id,
    cs.name                      AS set_name,
    cs.created_at,
    cs.end_date,
    cs.category_id,
    cat.name                     AS category_name,
    up.display_name              AS creator_display_name,
    up.profile_image_url         AS creator_image_url,
    up.username                  AS creator_username,
    COALESCE(vc.total_votes, 0)::int    AS total_votes,
    COALESCE(cc.total_comments, 0)::int AS total_comments,
    COALESCE(si.items, '[]'::json)      AS items
  FROM comparison_sets cs
  LEFT JOIN categories          cat ON cat.id    = cs.category_id
  LEFT JOIN user_preferences    up  ON up.user_id = cs.user_id
  LEFT JOIN vote_counts         vc  ON vc.set_id  = cs.id
  LEFT JOIN comment_counts      cc  ON cc.set_id  = cs.id
  LEFT JOIN set_items           si  ON si.set_id  = cs.id
  WHERE cs.is_published = TRUE
`;

/**
 * Top trending sets — ordered by vote count then recency.
 */
export async function getTrendingSets({ limit = 20 } = {}) {
  const { rows } = await db.execute(sql`
    ${BASE_SELECT}
    ORDER BY total_votes DESC NULLS LAST, cs.created_at DESC
    LIMIT ${limit}
  `);
  return rows;
}

/**
 * Filtered sets — supports category filter and optionally excludes sets the user already voted on.
 */
export async function getFilteredSets({ userId, categoryId, excludeVoted = false, limit = 20 } = {}) {
  const categoryClause = categoryId
    ? sql`AND cs.category_id = ${categoryId}`
    : sql``;

  const votedClause = excludeVoted && userId
    ? sql`AND NOT EXISTS (SELECT 1 FROM votes WHERE set_id = cs.id AND user_id = ${userId})`
    : sql``;

  const { rows } = await db.execute(sql`
    ${BASE_SELECT}
    ${categoryClause}
    ${votedClause}
    ORDER BY total_votes DESC NULLS LAST, cs.created_at DESC
    LIMIT ${limit}
  `);
  return rows;
}
