import { q } from '../db.js';

export async function seedCategories(CATEGORIES) {
  const ids = {};
  for (const name of CATEGORIES) {
    const ins = await q(
      `INSERT INTO categories (name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id`,
      [name],
    );
    ids[name] = ins.rows.length
      ? ins.rows[0].id
      : (await q(`SELECT id FROM categories WHERE name = $1`, [name])).rows[0].id;
  }
  return ids;
}

export async function seedItems(ITEMS, catIds) {
  const ids = {};
  for (const item of ITEMS) {
    const catId = catIds[item.category] ?? null;
    const ins = await q(
      `INSERT INTO items (name, description, item_color_string, image_url, category_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [item.name, item.description, item.color, item.image, catId],
    );
    ids[item.name] = ins.rows[0].id;
  }
  return ids;
}
