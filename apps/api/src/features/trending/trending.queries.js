import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

// ---------------------------------------------------------------------------
// Aspect queries
// ---------------------------------------------------------------------------

export async function getSetAspects(setId, userId = null) {
  if (userId) {
    const { rows } = await db.execute(sql`
      SELECT
        a.id, a.metric_name, a.description, a.weight, a.set_id,
        COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', v.id, 'user_id', v.user_id, 'item_id', v.item_id))
          FILTER (WHERE v.id IS NOT NULL), '[]'::json) AS votes,
        COUNT(v.id)::int AS total_votes,
        COALESCE(BOOL_OR(v.user_id = ${userId}), FALSE) AS user_voted,
        MAX(CASE WHEN v.user_id = ${userId} THEN v.item_id END) AS voted_item_id
      FROM comparison_set_aspects a
      LEFT JOIN votes v ON v.set_id = a.id
      WHERE a.set_id = ${setId}
      GROUP BY a.id ORDER BY a.id
    `);
    return rows;
  }
  const { rows } = await db.execute(sql`
    SELECT
      a.id, a.metric_name, a.description, a.weight, a.set_id,
      COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', v.id, 'user_id', v.user_id, 'item_id', v.item_id))
        FILTER (WHERE v.id IS NOT NULL), '[]'::json) AS votes,
      COUNT(v.id)::int AS total_votes,
      FALSE AS user_voted,
      NULL::int AS voted_item_id
    FROM comparison_set_aspects a
    LEFT JOIN votes v ON v.set_id = a.id
    WHERE a.set_id = ${setId}
    GROUP BY a.id ORDER BY a.id
  `);
  return rows;
}

export async function getAspect(aspectId, userId = null) {
  const voteFields = userId ? sql`
    COALESCE(BOOL_OR(v.user_id = ${userId}), FALSE) AS user_voted,
    MAX(CASE WHEN v.user_id = ${userId} THEN v.item_id END) AS voted_item_id,
  ` : sql`FALSE AS user_voted, NULL::int AS voted_item_id,`;

  const { rows } = await db.execute(sql`
    SELECT
      a.id, a.metric_name, a.description, a.weight, a.set_id,
      COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', v.id, 'user_id', v.user_id, 'item_id', v.item_id))
        FILTER (WHERE v.id IS NOT NULL), '[]'::json) AS votes,
      COUNT(v.id)::int AS total_votes,
      ${voteFields}
      COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('user_id', ar.user_id, 'reaction_type', ar.reaction_type))
        FILTER (WHERE ar.user_id IS NOT NULL), '[]'::json) AS reactions
    FROM comparison_set_aspects a
    LEFT JOIN votes v ON v.set_id = a.id
    LEFT JOIN comparison_aspect_reactions ar ON ar.aspect_id = a.id
    WHERE a.id = ${aspectId}
    GROUP BY a.id
  `);
  const aspect = rows[0] ?? null;
  if (!aspect) return null;

  const { rows: setRows } = await db.execute(sql`
    SELECT
      cs.id, cs.name, cs.category_id, cs.user_id, cs.created_at,
      up.display_name, up.profile_image_url,
      COALESCE(
        (SELECT JSON_AGG(JSONB_BUILD_OBJECT('id', i.id, 'name', i.name,
          'image_url', i.image_url, 'item_color_string', i.item_color_string))
         FROM comparison_set_items csi JOIN items i ON i.id = csi.item_id WHERE csi.set_id = cs.id),
        '[]'::json
      ) AS comparison_set_items
    FROM comparison_sets cs
    LEFT JOIN user_preferences up ON up.user_id = cs.user_id
    WHERE cs.id = ${aspect.set_id} LIMIT 1
  `);
  return { ...aspect, comparison_sets: setRows[0] ?? null };
}

export async function getRemainingAspects(aspectId, userId) {
  const { rows: parent } = await db.execute(sql`
    SELECT set_id FROM comparison_set_aspects WHERE id = ${aspectId} LIMIT 1
  `);
  if (!parent[0]) return [];
  const { rows } = await db.execute(sql`
    SELECT a.id, a.metric_name, a.description, a.weight, a.set_id
    FROM comparison_set_aspects a
    WHERE a.set_id = ${parent[0].set_id}
      AND a.id != ${aspectId}
      AND NOT EXISTS (SELECT 1 FROM votes v WHERE v.set_id = a.id AND v.user_id = ${userId})
    ORDER BY a.id
  `);
  return rows;
}

export async function getSimilarSets(setId, limit = 5, offset = 0) {
  const { rows } = await db.execute(sql`
    SELECT
      cs.id AS set_id, cs.name, cs.category_id, cs.created_at,
      cat.name AS category_name,
      up.display_name AS creator_display_name,
      up.profile_image_url AS creator_image_url,
      COALESCE(
        (SELECT JSON_AGG(JSONB_BUILD_OBJECT('id', i.id, 'name', i.name,
          'image_url', i.image_url, 'item_color_string', i.item_color_string))
         FROM comparison_set_items csi JOIN items i ON i.id = csi.item_id WHERE csi.set_id = cs.id),
        '[]'::json
      ) AS items
    FROM comparison_sets cs
    LEFT JOIN categories cat ON cat.id = cs.category_id
    LEFT JOIN user_preferences up ON up.user_id = cs.user_id
    WHERE cs.category_id = (SELECT category_id FROM comparison_sets WHERE id = ${setId})
      AND cs.id != ${setId}
      AND cs.is_published = TRUE
    ORDER BY cs.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);
  return rows;
}

export async function addAspectReaction(aspectId, userId, reactionType = 'like') {
  await db.execute(sql`
    INSERT INTO comparison_aspect_reactions (aspect_id, user_id, reaction_type)
    VALUES (${aspectId}, ${userId}, ${reactionType})
    ON CONFLICT (aspect_id, user_id) DO UPDATE SET reaction_type = EXCLUDED.reaction_type
  `);
}

export async function removeAspectReaction(aspectId, userId) {
  await db.execute(sql`
    DELETE FROM comparison_aspect_reactions WHERE aspect_id = ${aspectId} AND user_id = ${userId}
  `);
}

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
    ),
    user_like AS (
      SELECT set_id FROM comparison_set_likes WHERE user_id = ${userId}
    )` : sql``;

  const userVoteFields = userId ? sql`
    uv.vote_id,
    uv.voted_item_id,
    (uv.voted_item_id IS NOT NULL) AS has_voted,
    (ul.set_id IS NOT NULL)        AS has_liked,` : sql`
    NULL::int  AS vote_id,
    NULL::int  AS voted_item_id,
    FALSE      AS has_voted,
    FALSE      AS has_liked,`;

  const userVoteJoin = userId
    ? sql`LEFT JOIN user_vote uv ON uv.set_id = cs.id
    LEFT JOIN user_like ul ON ul.set_id = cs.id`
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
    like_counts AS (
      SELECT set_id, COUNT(*) AS total_likes
      FROM comparison_set_likes
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
      COALESCE(lc.total_likes, 0)::int    AS total_likes,
      COALESCE(si.items, '[]'::json)      AS items
    FROM comparison_sets cs
    LEFT JOIN categories        cat ON cat.id     = cs.category_id
    LEFT JOIN user_preferences  up  ON up.user_id  = cs.user_id
    LEFT JOIN vote_counts       vc  ON vc.set_id   = cs.id
    LEFT JOIN comment_counts    cc  ON cc.set_id   = cs.id
    LEFT JOIN like_counts       lc  ON lc.set_id   = cs.id
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
