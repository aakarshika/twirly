import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

export async function getUserPolls(userId) {
  const { rows } = await db.execute(sql`
    SELECT
      cs.id,
      cs.name                        AS title,
      cs.created_at                  AS date,
      'active'                       AS status,
      COALESCE(cat.name, 'Uncategorized') AS category,
      COUNT(v.id)::int               AS votes
    FROM comparison_sets cs
    LEFT JOIN categories cat ON cat.id = cs.category_id
    LEFT JOIN votes      v   ON v.set_id = cs.id
    WHERE cs.user_id = ${userId}
    GROUP BY cs.id, cs.name, cs.created_at, cat.name
    ORDER BY cs.created_at DESC
  `);
  return rows;
}
