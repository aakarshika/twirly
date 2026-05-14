import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

// ---------------------------------------------------------------------------
// requireOwner helper — returns minimal {userId} for ownership check
// ---------------------------------------------------------------------------
export async function getComparisonSetById(id) {
  const { rows } = await db.execute(sql`
    SELECT id, user_id AS "userId"
    FROM comparison_sets WHERE id = ${id} LIMIT 1
  `);
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Full comparison with nested items + aspects — used by GET /:id and GET /unpublished. */
export async function getFullComparison(id) {
  const { rows } = await db.execute(sql`
    SELECT
      cs.id, cs.user_id, cs.name, cs.category_id,
      cs.is_published, cs.end_date, cs.created_at,
      (
        SELECT COALESCE(JSON_AGG(r ORDER BY r.id), '[]'::json)
        FROM (
          SELECT csi.id, csi.item_id, csi.set_id,
                 JSONB_BUILD_OBJECT(
                   'id',               i.id,
                   'name',             i.name,
                   'description',      i.description,
                   'image_url',        i.image_url,
                   'item_color_string',i.item_color_string,
                   'user_id',          i.user_id
                 ) AS items
          FROM comparison_set_items csi
          JOIN items i ON i.id = csi.item_id
          WHERE csi.set_id = cs.id
        ) r
      ) AS comparison_set_items,
      (
        SELECT COALESCE(JSON_AGG(r ORDER BY r.id), '[]'::json)
        FROM (
          SELECT csa.id, csa.set_id, csa.metric_name, csa.description, csa.weight
          FROM comparison_set_aspects csa
          WHERE csa.set_id = cs.id
        ) r
      ) AS comparison_set_aspects
    FROM comparison_sets cs
    WHERE cs.id = ${id}
  `);
  return rows[0] ?? null;
}

/** List of published comparisons with item thumbnails + comment count. */
export async function getAllComparisons(limit = 20) {
  const { rows } = await db.execute(sql`
    SELECT
      cs.id, cs.user_id, cs.name, cs.category_id,
      cs.is_published, cs.end_date, cs.created_at,
      (
        SELECT COALESCE(JSON_AGG(r ORDER BY r.id), '[]'::json)
        FROM (
          SELECT csi.id, csi.item_id,
                 JSONB_BUILD_OBJECT(
                   'id', i.id, 'name', i.name,
                   'image_url', i.image_url, 'item_color_string', i.item_color_string,
                   'user_id', i.user_id
                 ) AS items
          FROM comparison_set_items csi
          JOIN items i ON i.id = csi.item_id
          WHERE csi.set_id = cs.id
        ) r
      ) AS comparison_set_items,
      (SELECT COUNT(*)::int FROM comparison_set_comments csc WHERE csc.set_id = cs.id) AS comment_count
    FROM comparison_sets cs
    WHERE cs.is_published = true
    ORDER BY cs.created_at DESC
    LIMIT ${limit}
  `);
  return rows;
}

/** All comparisons for a user (published + drafts) with items + comment count. */
export async function getUserComparisons(userId) {
  const { rows } = await db.execute(sql`
    SELECT
      cs.id, cs.user_id, cs.name, cs.category_id,
      cs.is_published, cs.end_date, cs.created_at,
      (
        SELECT COALESCE(JSON_AGG(r ORDER BY r.id), '[]'::json)
        FROM (
          SELECT csi.id, csi.item_id, csi.set_id,
                 JSONB_BUILD_OBJECT(
                   'id', i.id, 'name', i.name, 'description', i.description,
                   'image_url', i.image_url, 'item_color_string', i.item_color_string,
                   'user_id', i.user_id
                 ) AS items
          FROM comparison_set_items csi
          JOIN items i ON i.id = csi.item_id
          WHERE csi.set_id = cs.id
        ) r
      ) AS comparison_set_items,
      (SELECT COUNT(*)::int FROM comparison_set_comments csc WHERE csc.set_id = cs.id) AS comment_count
    FROM comparison_sets cs
    WHERE cs.user_id = ${userId}
    ORDER BY cs.created_at DESC
  `);
  return rows;
}

/** User's most-recently-updated draft (is_published = false), fully hydrated. */
export async function getUnpublishedComparison(userId) {
  const { rows } = await db.execute(sql`
    SELECT
      cs.id, cs.user_id, cs.name, cs.category_id,
      cs.is_published, cs.end_date, cs.created_at,
      (
        SELECT COALESCE(JSON_AGG(r ORDER BY r.id), '[]'::json)
        FROM (
          SELECT csi.id, csi.item_id, csi.set_id,
                 JSONB_BUILD_OBJECT(
                   'id', i.id, 'name', i.name, 'description', i.description,
                   'image_url', i.image_url, 'item_color_string', i.item_color_string,
                   'user_id', i.user_id
                 ) AS items
          FROM comparison_set_items csi
          JOIN items i ON i.id = csi.item_id
          WHERE csi.set_id = cs.id
        ) r
      ) AS comparison_set_items,
      (
        SELECT COALESCE(JSON_AGG(r ORDER BY r.id), '[]'::json)
        FROM (
          SELECT csa.id, csa.set_id, csa.metric_name, csa.description, csa.weight
          FROM comparison_set_aspects csa
          WHERE csa.set_id = cs.id
        ) r
      ) AS comparison_set_aspects
    FROM comparison_sets cs
    WHERE cs.user_id = ${userId} AND cs.is_published = false
    ORDER BY cs.created_at DESC
    LIMIT 1
  `);
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Writes (transactions)
// ---------------------------------------------------------------------------

/**
 * Create a comparison set with items and aspects atomically.
 * Returns the newly created comparison_sets row.
 */
export async function createComparison({ userId, name, categoryId, endDate, isPublished, itemIds = [], aspects = [] }) {
  return db.transaction(async (tx) => {
    const { rows: [set] } = await tx.execute(sql`
      INSERT INTO comparison_sets (user_id, name, category_id, end_date, is_published)
      VALUES (${userId}, ${name}, ${categoryId ?? null}, ${endDate ?? null}, ${isPublished ?? true})
      RETURNING id, user_id, name, category_id, is_published, end_date, created_at
    `);

    for (const itemId of itemIds) {
      await tx.execute(sql`
        INSERT INTO comparison_set_items (set_id, item_id) VALUES (${set.id}, ${itemId})
      `);
    }

    for (const aspect of aspects) {
      await tx.execute(sql`
        INSERT INTO comparison_set_aspects (set_id, metric_name, description, weight)
        VALUES (${set.id}, ${aspect.metricName}, ${aspect.description ?? null}, ${aspect.weight ?? 1})
      `);
    }

    return set;
  });
}

/**
 * Full transactional update: set metadata + optional item replacement + optional aspect upsert.
 * - itemIds: if provided, replaces all items (DELETE + INSERT)
 * - aspects: if provided, upserts by id (preserves IDs so vote references stay valid)
 */
export async function updateComparison(id, { name, categoryId, endDate, isPublished, itemIds, aspects }) {
  return db.transaction(async (tx) => {
    const { rows: [set] } = await tx.execute(sql`
      UPDATE comparison_sets
      SET
        name         = COALESCE(${name ?? null},        name),
        category_id  = COALESCE(${categoryId ?? null},  category_id),
        end_date     = COALESCE(${endDate ?? null},     end_date),
        is_published = COALESCE(${isPublished ?? null}, is_published)
      WHERE id = ${id}
      RETURNING id, user_id, name, category_id, is_published, end_date, created_at
    `);
    if (!set) return null;

    if (itemIds !== undefined) {
      await tx.execute(sql`DELETE FROM comparison_set_items WHERE set_id = ${id}`);
      for (const itemId of itemIds) {
        await tx.execute(sql`
          INSERT INTO comparison_set_items (set_id, item_id) VALUES (${id}, ${itemId})
        `);
      }
    }

    if (aspects !== undefined) {
      const { rows: existing } = await tx.execute(sql`
        SELECT id FROM comparison_set_aspects WHERE set_id = ${id}
      `);
      const existingIds = existing.map(r => r.id);
      const keepIds = aspects.filter(a => a.id).map(a => a.id);
      const deleteIds = existingIds.filter(eid => !keepIds.includes(eid));

      for (const aspectId of deleteIds) {
        await tx.execute(sql`DELETE FROM comparison_set_aspects WHERE id = ${aspectId}`);
      }

      for (const aspect of aspects) {
        if (aspect.id) {
          await tx.execute(sql`
            UPDATE comparison_set_aspects
            SET metric_name = ${aspect.metricName},
                description = ${aspect.description ?? null},
                weight      = ${aspect.weight ?? 1}
            WHERE id = ${aspect.id} AND set_id = ${id}
          `);
        } else {
          await tx.execute(sql`
            INSERT INTO comparison_set_aspects (set_id, metric_name, description, weight)
            VALUES (${id}, ${aspect.metricName}, ${aspect.description ?? null}, ${aspect.weight ?? 1})
          `);
        }
      }
    }

    return set;
  });
}

/** Replace all items for a set atomically. */
export async function updateItems(setId, itemIds) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`DELETE FROM comparison_set_items WHERE set_id = ${setId}`);
    for (const itemId of itemIds) {
      await tx.execute(sql`
        INSERT INTO comparison_set_items (set_id, item_id) VALUES (${setId}, ${itemId})
      `);
    }
    return { setId, count: itemIds.length };
  });
}

/** Upsert aspects for a set atomically (preserves IDs, deletes removed ones). */
export async function updateAspects(setId, aspects) {
  return db.transaction(async (tx) => {
    const { rows: existing } = await tx.execute(sql`
      SELECT id FROM comparison_set_aspects WHERE set_id = ${setId}
    `);
    const existingIds = existing.map(r => r.id);
    const keepIds = aspects.filter(a => a.id).map(a => a.id);
    const deleteIds = existingIds.filter(eid => !keepIds.includes(eid));

    for (const aspectId of deleteIds) {
      await tx.execute(sql`DELETE FROM comparison_set_aspects WHERE id = ${aspectId}`);
    }

    for (const aspect of aspects) {
      if (aspect.id) {
        await tx.execute(sql`
          UPDATE comparison_set_aspects
          SET metric_name = ${aspect.metricName},
              description = ${aspect.description ?? null},
              weight      = ${aspect.weight ?? 1}
          WHERE id = ${aspect.id} AND set_id = ${setId}
        `);
      } else {
        await tx.execute(sql`
          INSERT INTO comparison_set_aspects (set_id, metric_name, description, weight)
          VALUES (${setId}, ${aspect.metricName}, ${aspect.description ?? null}, ${aspect.weight ?? 1})
        `);
      }
    }

    return { setId, count: aspects.length };
  });
}

/** Delete a comparison set. Returns deleted row or null. */
export async function deleteComparisonSet(id) {
  const { rows } = await db.execute(sql`
    DELETE FROM comparison_sets WHERE id = ${id} RETURNING id
  `);
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Likes (set-level)
// ---------------------------------------------------------------------------

export async function likeSet(setId, userId) {
  const { rows } = await db.execute(sql`
    INSERT INTO comparison_set_likes (set_id, user_id)
    VALUES (${setId}, ${userId})
    ON CONFLICT DO NOTHING
    RETURNING 1
  `);
  return rows.length > 0 ? { added: true } : { alreadyLiked: true };
}

export async function unlikeSet(setId, userId) {
  const { rows } = await db.execute(sql`
    DELETE FROM comparison_set_likes WHERE set_id = ${setId} AND user_id = ${userId} RETURNING 1
  `);
  return rows.length > 0 ? { removed: true } : { notLiked: true };
}
