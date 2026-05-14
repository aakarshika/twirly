import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

/** Comments from comparison sets that contain this item, paginated. */
export async function getItemComments(itemId, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const { rows } = await db.execute(sql`
    SELECT
      c.id, c.content, c.created_at, c.user_id,
      up.display_name, up.profile_image_url,
      cs.id AS set_id, cs.name AS set_name,
      COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
        'id', r.id, 'reaction_type', r.reaction_type, 'user_id', r.user_id
      )) FILTER (WHERE r.id IS NOT NULL), '[]'::json) AS reactions,
      (SELECT COUNT(*)::int FROM comparison_set_comments rep WHERE rep.parent_id = c.id) AS reply_count
    FROM comparison_set_comments c
    JOIN comparison_sets cs ON cs.id = c.set_id
    JOIN comparison_set_items csi ON csi.set_id = cs.id AND csi.item_id = ${itemId}
    LEFT JOIN user_preferences up ON up.user_id = c.user_id
    LEFT JOIN comparison_set_comment_reactions r ON r.comment_id = c.id
    WHERE c.parent_id IS NULL
    GROUP BY c.id, c.content, c.created_at, c.user_id, up.display_name, up.profile_image_url, cs.id, cs.name
    ORDER BY c.created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `);
  const { rows: countRows } = await db.execute(sql`
    SELECT COUNT(DISTINCT c.id)::int AS total
    FROM comparison_set_comments c
    JOIN comparison_set_items csi ON csi.set_id = c.set_id AND csi.item_id = ${itemId}
    WHERE c.parent_id IS NULL
  `);
  return { comments: rows, total: countRows[0]?.total ?? 0 };
}

/** Single item with category. */
export async function getItem(id) {
  const { rows } = await db.execute(sql`
    SELECT
      i.id,
      i.name,
      i.description,
      i.image_url,
      i.item_color_string,
      i.created_at,
      cat.id   AS category_id,
      cat.name AS category_name
    FROM items i
    LEFT JOIN categories cat ON cat.id = i.category_id
    WHERE i.id = ${id}
    LIMIT 1
  `);
  return rows[0] ?? null;
}

/**
 * Average metrics from the item_metric_averages view.
 * Returns [] if the view doesn't exist yet (Supabase only).
 */
export async function getItemMetrics(id) {
  try {
    const { rows } = await db.execute(sql`
      SELECT metric_name, avg_rating, total_reviews
      FROM item_metric_averages
      WHERE item_id = ${id}
    `);
    return rows;
  } catch {
    return [];
  }
}

/** Published comparison sets that include this item, with vote/comment counts. */
export async function getItemSets(id) {
  const { rows } = await db.execute(sql`
    SELECT
      cs.id,
      cs.name,
      cs.end_date,
      cs.created_at,
      up.display_name   AS creator_display_name,
      up.profile_image_url AS creator_image_url,
      COALESCE((SELECT COUNT(*)::int FROM votes WHERE set_id = cs.id), 0)                     AS total_votes,
      COALESCE((SELECT COUNT(*)::int FROM comparison_set_comments WHERE set_id = cs.id), 0)   AS total_comments,
      (
        SELECT json_agg(json_build_object('id', i.id, 'name', i.name, 'image_url', i.image_url))
        FROM comparison_set_items csi2
        JOIN items i ON i.id = csi2.item_id
        WHERE csi2.set_id = cs.id
      ) AS items
    FROM comparison_sets cs
    JOIN comparison_set_items csi ON csi.set_id = cs.id
    LEFT JOIN user_preferences up ON up.user_id = cs.user_id
    WHERE csi.item_id = ${id}
      AND cs.is_published = TRUE
    ORDER BY cs.created_at DESC
    LIMIT 20
  `);
  return rows;
}
