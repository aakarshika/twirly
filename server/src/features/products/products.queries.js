import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

/** Single item with all its categories. */
export async function getProduct(id) {
  const { rows } = await db.execute(sql`
    SELECT
      i.id, i.name, i.description, i.image_url, i.item_color_string,
      i.user_id, i.category_id, i.created_at, i.updated_at,
      COALESCE(
        json_agg(json_build_object('id', c.id, 'name', c.name))
        FILTER (WHERE c.id IS NOT NULL),
        '[]'::json
      ) AS categories
    FROM items i
    LEFT JOIN item_categories ic ON ic.item_id = i.id
    LEFT JOIN categories c ON c.id = ic.category_id
    WHERE i.id = ${id}
    GROUP BY i.id
    LIMIT 1
  `);
  return rows[0] ?? null;
}

/** Used by requireOwner — returns { userId } or null. */
export async function getProductById(id) {
  const { rows } = await db.execute(sql`
    SELECT id, user_id AS "userId" FROM items WHERE id = ${id} LIMIT 1
  `);
  return rows[0] ?? null;
}

/** All products owned by a user, each with its categories. */
export async function getUserProducts(userId) {
  const { rows } = await db.execute(sql`
    SELECT
      i.id, i.name, i.description, i.image_url, i.item_color_string,
      i.category_id, i.created_at, i.updated_at,
      COALESCE(
        json_agg(json_build_object('id', c.id, 'name', c.name))
        FILTER (WHERE c.id IS NOT NULL),
        '[]'::json
      ) AS categories
    FROM items i
    LEFT JOIN item_categories ic ON ic.item_id = i.id
    LEFT JOIN categories c ON c.id = ic.category_id
    WHERE i.user_id = ${userId}
    GROUP BY i.id
    ORDER BY i.created_at DESC
  `);
  return rows;
}

/** ILIKE search on item name. */
export async function searchProducts(q, limit = 10) {
  const pattern = `%${q}%`;
  const { rows } = await db.execute(sql`
    SELECT id, name, image_url, item_color_string, category_id
    FROM items
    WHERE name ILIKE ${pattern}
    ORDER BY name
    LIMIT ${limit}
  `);
  return rows;
}

/** Create an item + its category mappings in a transaction. */
export async function createProduct(userId, { name, description, imageUrl, itemColorString, categoryIds }) {
  return db.transaction(async (tx) => {
    const primaryCat = categoryIds[0] ?? null;

    const { rows } = await tx.execute(sql`
      INSERT INTO items (user_id, name, description, image_url, item_color_string, category_id)
      VALUES (${userId}, ${name}, ${description ?? null}, ${imageUrl ?? null}, ${itemColorString ?? null}, ${primaryCat})
      RETURNING id, user_id, name, description, image_url, item_color_string, category_id, created_at, updated_at
    `);
    const item = rows[0];

    for (const catId of categoryIds) {
      await tx.execute(sql`
        INSERT INTO item_categories (item_id, category_id) VALUES (${item.id}, ${catId})
        ON CONFLICT DO NOTHING
      `);
    }

    return { ...item, categories: [] };
  });
}

/** Update an item + replace its category mappings in a transaction. */
export async function updateProduct(id, { name, description, imageUrl, itemColorString, categoryIds }) {
  return db.transaction(async (tx) => {
    const primaryCat = categoryIds?.length ? categoryIds[0] : undefined;

    const { rows } = await tx.execute(sql`
      UPDATE items
      SET
        name             = COALESCE(${name ?? null}, name),
        description      = COALESCE(${description ?? null}, description),
        image_url        = COALESCE(${imageUrl ?? null}, image_url),
        item_color_string = COALESCE(${itemColorString ?? null}, item_color_string),
        category_id      = COALESCE(${primaryCat ?? null}, category_id),
        updated_at       = now()
      WHERE id = ${id}
      RETURNING id, user_id, name, description, image_url, item_color_string, category_id, created_at, updated_at
    `);
    if (!rows[0]) return null;

    if (categoryIds !== undefined) {
      await tx.execute(sql`DELETE FROM item_categories WHERE item_id = ${id}`);
      for (const catId of categoryIds) {
        await tx.execute(sql`
          INSERT INTO item_categories (item_id, category_id) VALUES (${id}, ${catId})
          ON CONFLICT DO NOTHING
        `);
      }
    }

    return rows[0];
  });
}

/** Delete an item by id. Returns deleted row or null. */
export async function deleteProduct(id) {
  const { rows } = await db.execute(sql`
    DELETE FROM items WHERE id = ${id} RETURNING id
  `);
  return rows[0] ?? null;
}
