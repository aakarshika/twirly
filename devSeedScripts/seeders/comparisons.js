import { q } from '../db.js';

export async function seedComparisons(COMPARISONS, catIds, itemIds, userIds) {
  const setIds = {};
  for (const def of COMPARISONS) {
    const ownerId = userIds[def.owner];
    if (!ownerId) { console.warn(`  SKIP set — unknown owner: ${def.owner}`); continue; }

    const ins = await q(
      `INSERT INTO comparison_sets (name, user_id, category_id, is_published, start_date, end_date)
       VALUES ($1, $2, $3, true, now(), now() + interval '30 days') RETURNING id`,
      [def.name, ownerId, catIds[def.category] ?? null],
    );
    const setId = ins.rows[0].id;
    setIds[def.name] = setId;
    console.log(`  [${def.owner}] ${def.name} (${def.items.length} items)`);

    for (const itemName of def.items) {
      const itemId = itemIds[itemName];
      if (!itemId) { console.warn(`    SKIP item not found: ${itemName}`); continue; }
      await q(`INSERT INTO comparison_set_items (set_id, item_id) VALUES ($1, $2)`, [setId, itemId]);
    }

    for (const asp of def.aspects) {
      await q(
        `INSERT INTO comparison_set_aspects (set_id, metric_name, description, weight) VALUES ($1, $2, $3, $4)`,
        [setId, asp.metric, asp.description, asp.weight],
      );
    }
  }
  return setIds;
}
