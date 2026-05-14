import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

const SET_SELECT = sql`
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
          'id',                i.id,
          'name',              i.name,
          'image_url',         i.image_url,
          'item_color_string', i.item_color_string
        ) ORDER BY csi.id
      ) AS items
    FROM comparison_set_items csi
    JOIN items i ON i.id = csi.item_id
    GROUP BY csi.set_id
  )
  SELECT
    cs.id                              AS set_id,
    cs.name                            AS set_name,
    cs.created_at,
    cs.end_date,
    cs.category_id,
    cat.name                           AS category_name,
    up.display_name                    AS creator_display_name,
    up.profile_image_url               AS creator_image_url,
    up.username                        AS creator_username,
    COALESCE(vc.total_votes, 0)::int   AS total_votes,
    COALESCE(cc.total_comments, 0)::int AS total_comments,
    COALESCE(si.items, '[]'::json)     AS items
  FROM comparison_sets cs
  LEFT JOIN categories        cat ON cat.id     = cs.category_id
  LEFT JOIN user_preferences  up  ON up.user_id  = cs.user_id
  LEFT JOIN vote_counts       vc  ON vc.set_id   = cs.id
  LEFT JOIN comment_counts    cc  ON cc.set_id   = cs.id
  LEFT JOIN set_items         si  ON si.set_id   = cs.id
  WHERE cs.is_published = TRUE
`;

export async function searchSets(q, limit = 10) {
  const pattern = `%${q}%`;
  const { rows } = await db.execute(sql`
    ${SET_SELECT}
    AND cs.name ILIKE ${pattern}
    ORDER BY total_votes DESC NULLS LAST, cs.created_at DESC
    LIMIT ${limit}
  `);
  return rows;
}

export async function searchItems(q, limit = 10) {
  const pattern = `%${q}%`;
  const { rows } = await db.execute(sql`
    SELECT
      i.id,
      i.name,
      i.image_url,
      i.item_color_string,
      CASE WHEN c.id IS NOT NULL
        THEN json_build_array(json_build_object('id', c.id, 'name', c.name))
        ELSE '[]'::json
      END AS categories
    FROM items i
    LEFT JOIN categories c ON c.id = i.category_id
    WHERE i.name ILIKE ${pattern}
    ORDER BY i.id DESC
    LIMIT ${limit}
  `);
  return rows;
}

export async function searchUsers(q, limit = 10) {
  const pattern = `%${q}%`;
  const { rows } = await db.execute(sql`
    SELECT user_id, username, display_name, profile_image_url
    FROM user_preferences
    WHERE display_name ILIKE ${pattern}
       OR username ILIKE ${pattern}
    LIMIT ${limit}
  `);
  return rows;
}
