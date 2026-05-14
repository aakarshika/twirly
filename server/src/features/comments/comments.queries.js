import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

/** Paginated top-level comments for a set, with reactions and nested replies. */
export async function getComments(setId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  const { rows } = await db.execute(sql`
    WITH top_level AS (
      SELECT id, content, created_at, user_id
      FROM comparison_set_comments
      WHERE set_id = ${setId} AND parent_id IS NULL
      ORDER BY created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    )
    SELECT
      tl.id,
      tl.content,
      tl.created_at,
      up.display_name,
      up.profile_image_url,
      COALESCE(
        JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
          'id', r.id, 'reaction_type', r.reaction_type, 'user_id', r.user_id
        )) FILTER (WHERE r.id IS NOT NULL),
        '[]'::json
      ) AS reactions,
      COALESCE(
        (SELECT JSON_AGG(
          JSONB_BUILD_OBJECT(
            'id', rep.id,
            'content', rep.content,
            'created_at', rep.created_at,
            'display_name', rup.display_name,
            'profile_image_url', rup.profile_image_url,
            'reactions', COALESCE(
              (SELECT JSON_AGG(JSONB_BUILD_OBJECT(
                'id', rr.id, 'reaction_type', rr.reaction_type, 'user_id', rr.user_id
              ))
               FROM comparison_set_comment_reactions rr WHERE rr.comment_id = rep.id),
              '[]'::json
            )
          ) ORDER BY rep.created_at ASC
        )
        FROM comparison_set_comments rep
        LEFT JOIN user_preferences rup ON rup.user_id = rep.user_id
        WHERE rep.parent_id = tl.id),
        '[]'::json
      ) AS replies
    FROM top_level tl
    LEFT JOIN user_preferences up ON up.user_id = tl.user_id
    LEFT JOIN comparison_set_comment_reactions r ON r.comment_id = tl.id
    GROUP BY tl.id, tl.content, tl.created_at, up.display_name, up.profile_image_url
    ORDER BY tl.created_at DESC
  `);

  const { rows: countRows } = await db.execute(sql`
    SELECT COUNT(*)::int AS total
    FROM comparison_set_comments
    WHERE set_id = ${setId} AND parent_id IS NULL
  `);

  return { comments: rows, total: countRows[0]?.total ?? 0 };
}

/** Paginated top-level comments by a user across all sets. */
export async function getUserComments(userId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  const { rows } = await db.execute(sql`
    SELECT
      c.id,
      c.content,
      c.created_at,
      cs.id   AS set_id,
      cs.name AS set_name
    FROM comparison_set_comments c
    JOIN comparison_sets cs ON cs.id = c.set_id
    WHERE c.user_id = ${userId} AND c.parent_id IS NULL
    ORDER BY c.created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `);

  const { rows: countRows } = await db.execute(sql`
    SELECT COUNT(*)::int AS total
    FROM comparison_set_comments
    WHERE user_id = ${userId} AND parent_id IS NULL
  `);

  return { comments: rows, total: countRows[0]?.total ?? 0 };
}

/** Insert a top-level comment on a set. */
export async function postComment(setId, userId, content) {
  const { rows } = await db.execute(sql`
    INSERT INTO comparison_set_comments (set_id, user_id, content, parent_id)
    VALUES (${setId}, ${userId}, ${content}, NULL)
    RETURNING id, set_id, user_id, content, created_at
  `);
  return rows[0] ?? null;
}

/** Insert a reply (parent_id = commentId; inherits set_id). */
export async function postReply(commentId, userId, content) {
  const { rows } = await db.execute(sql`
    INSERT INTO comparison_set_comments (set_id, user_id, content, parent_id)
    SELECT set_id, ${userId}, ${content}, ${commentId}
    FROM comparison_set_comments WHERE id = ${commentId}
    RETURNING id, set_id, user_id, content, parent_id, created_at
  `);
  return rows[0] ?? null;
}

/** Load a comment by id — used by requireOwner. */
export async function getCommentById(id) {
  const { rows } = await db.execute(sql`
    SELECT id, user_id AS "userId", content, parent_id, set_id
    FROM comparison_set_comments WHERE id = ${id} LIMIT 1
  `);
  return rows[0] ?? null;
}

/** Add a reaction (idempotent — no-op if already reacted). */
export async function addReaction(commentId, userId, reactionType = 'like') {
  await db.execute(sql`
    INSERT INTO comparison_set_comment_reactions (comment_id, user_id, reaction_type)
    VALUES (${commentId}, ${userId}, ${reactionType})
    ON CONFLICT (comment_id, user_id) DO NOTHING
  `);
}

/** Remove a reaction. */
export async function removeReaction(commentId, userId) {
  await db.execute(sql`
    DELETE FROM comparison_set_comment_reactions
    WHERE comment_id = ${commentId} AND user_id = ${userId}
  `);
}
