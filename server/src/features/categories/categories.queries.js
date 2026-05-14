import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

/** Search categories by name (empty query returns top 20). */
export async function searchCategories(q = '', limit = 20) {
  if (q.trim()) {
    const pattern = `%${q}%`;
    const { rows } = await db.execute(sql`
      SELECT id, name FROM categories WHERE name ILIKE ${pattern} ORDER BY name LIMIT ${limit}
    `);
    return rows;
  }
  const { rows } = await db.execute(sql`
    SELECT id, name FROM categories ORDER BY name LIMIT ${limit}
  `);
  return rows;
}

/** Top categories ordered by number of published comparison sets. */
export async function getPopularCategories(limit = 20) {
  const { rows } = await db.execute(sql`
    SELECT c.id, c.name, COUNT(cs.id)::int AS set_count
    FROM categories c
    LEFT JOIN comparison_sets cs ON cs.category_id = c.id AND cs.is_published = TRUE
    GROUP BY c.id, c.name
    ORDER BY set_count DESC, c.name
    LIMIT ${limit}
  `);
  return rows;
}

/** Create a category. Returns the created row. */
export async function createCategory(name) {
  const { rows } = await db.execute(sql`
    INSERT INTO categories (name)
    VALUES (${name})
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id, name, created_at
  `);
  return rows[0];
}
