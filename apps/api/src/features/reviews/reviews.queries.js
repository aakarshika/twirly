import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

/** Paginated reviews for an item, with optional has_liked for the caller. */
export async function getReviews(itemId, page = 1, pageSize = 10, userId = null) {
  const offset = (page - 1) * pageSize;

  const { rows } = await db.execute(sql`
    SELECT
      r.id,
      r.text,
      r.likes,
      r.created_at,
      up.display_name,
      up.profile_image_url,
      ${userId
        ? sql`EXISTS (
            SELECT 1 FROM review_likes rl
            WHERE rl.review_id = r.id AND rl.user_id = ${userId}
          ) AS has_liked`
        : sql`FALSE AS has_liked`}
    FROM reviews r
    LEFT JOIN user_preferences up ON up.user_id = r.user_id
    WHERE r.item_id = ${itemId}
    ORDER BY r.created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `);

  const { rows: countRows } = await db.execute(sql`
    SELECT COUNT(*)::int AS total FROM reviews WHERE item_id = ${itemId}
  `);

  return { reviews: rows, total: countRows[0]?.total ?? 0 };
}

/** Paginated reviews by a user, enriched with item and category info. */
export async function getUserReviews(userId, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;

  const { rows } = await db.execute(sql`
    SELECT
      r.id,
      r.text,
      r.likes,
      r.created_at,
      i.id   AS item_id,
      i.name AS item_name,
      cat.name AS category_name
    FROM reviews r
    JOIN items i ON i.id = r.item_id
    LEFT JOIN categories cat ON cat.id = i.category_id
    WHERE r.user_id = ${userId}
    ORDER BY r.created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `);

  const { rows: countRows } = await db.execute(sql`
    SELECT COUNT(*)::int AS total FROM reviews WHERE user_id = ${userId}
  `);

  return { reviews: rows, total: countRows[0]?.total ?? 0 };
}

/** Insert a review and return the created row. */
export async function postReview(itemId, userId, text) {
  const { rows } = await db.execute(sql`
    INSERT INTO reviews (item_id, user_id, text, likes)
    VALUES (${itemId}, ${userId}, ${text}, 0)
    RETURNING id, item_id, user_id, text, likes, created_at
  `);
  return rows[0] ?? null;
}

/** Load a review by id — used by requireOwner. Returns { userId, ... } or null. */
export async function getReviewById(id) {
  const { rows } = await db.execute(sql`
    SELECT id, user_id AS "userId", item_id, text, likes
    FROM reviews WHERE id = ${id} LIMIT 1
  `);
  return rows[0] ?? null;
}

/**
 * Like a review — inserts into review_likes and increments reviews.likes.
 * No-op if already liked; returns updated review or null.
 */
export async function likeReview(reviewId, userId) {
  const { rows: inserted } = await db.execute(sql`
    INSERT INTO review_likes (review_id, user_id)
    VALUES (${reviewId}, ${userId})
    ON CONFLICT DO NOTHING
    RETURNING 1
  `);
  if (inserted.length === 0) return null;

  const { rows } = await db.execute(sql`
    UPDATE reviews
    SET likes = likes + 1, updated_at = now()
    WHERE id = ${reviewId}
    RETURNING id, item_id, user_id, text, likes, created_at, updated_at
  `);
  return rows[0] ?? null;
}

/**
 * Unlike a review — removes from review_likes and decrements reviews.likes.
 * No-op if not liked; returns updated review or null.
 */
export async function unlikeReview(reviewId, userId) {
  const { rows: deleted } = await db.execute(sql`
    DELETE FROM review_likes WHERE review_id = ${reviewId} AND user_id = ${userId} RETURNING 1
  `);
  if (deleted.length === 0) return null;

  const { rows } = await db.execute(sql`
    UPDATE reviews
    SET likes = GREATEST(likes - 1, 0), updated_at = now()
    WHERE id = ${reviewId}
    RETURNING id, item_id, user_id, text, likes, created_at, updated_at
  `);
  return rows[0] ?? null;
}
