import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function getUserByUsername(username) {
  const { rows } = await db.execute(sql`
    SELECT user_id, username, display_name, bio, profile_image_url, created_at, updated_at
    FROM user_preferences
    WHERE display_name = ${username}
    LIMIT 1
  `);
  return rows[0] ?? null;
}

/**
 * User profile from user_preferences + computed activity counts.
 * Returns null if user has no user_preferences row yet (brand-new user).
 */
export async function getUserProfile(userId) {
  const { rows } = await db.execute(sql`
    SELECT
      up.user_id, up.display_name, up.username, up.profile_image_url, up.bio,
      up.created_at, up.updated_at,
      (SELECT COUNT(*)::int FROM votes        WHERE user_id = ${userId}) AS total_votes,
      (SELECT COUNT(*)::int FROM reviews      WHERE user_id = ${userId}) AS total_reviews,
      (SELECT COUNT(*)::int FROM items        WHERE user_id = ${userId}) AS total_products,
      (SELECT COUNT(*)::int FROM comparison_sets WHERE user_id = ${userId}) AS total_comparisons,
      (SELECT COALESCE(SUM(likes), 0)::int FROM reviews WHERE user_id = ${userId}) AS total_likes_received
    FROM user_preferences up
    WHERE up.user_id = ${userId}
  `);
  return rows[0] ?? null;
}

/** Standalone activity counts without profile fields. */
export async function getActivitySummary(userId) {
  const { rows } = await db.execute(sql`
    SELECT
      (SELECT COUNT(*)::int FROM votes        WHERE user_id = ${userId}) AS total_votes,
      (SELECT COUNT(*)::int FROM reviews      WHERE user_id = ${userId}) AS total_reviews,
      (SELECT COUNT(*)::int FROM items        WHERE user_id = ${userId}) AS total_products,
      (SELECT COUNT(*)::int FROM comparison_sets WHERE user_id = ${userId}) AS total_comparisons,
      (SELECT COALESCE(SUM(likes), 0)::int FROM reviews WHERE user_id = ${userId}) AS total_likes_received
  `);
  return rows[0] ?? null;
}

export async function getNotificationSettings(userId) {
  const { rows } = await db.execute(sql`
    SELECT * FROM user_notification_settings WHERE user_id = ${userId} LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function getCategoryPreferences(userId) {
  const { rows } = await db.execute(sql`
    SELECT ucp.category_id, c.name AS category_name
    FROM user_category_preferences ucp
    JOIN categories c ON c.id = ucp.category_id
    WHERE ucp.user_id = ${userId}
    ORDER BY c.name
  `);
  return rows;
}

/**
 * Returns true when the username is unclaimed (or belongs to excludeUserId).
 * Pass excludeUserId = current user's id when they're updating their own profile.
 */
export async function checkUsernameAvailability(username, excludeUserId = null) {
  if (excludeUserId) {
    const { rows } = await db.execute(sql`
      SELECT 1 FROM user_preferences
      WHERE username = ${username} AND user_id != ${excludeUserId}
      LIMIT 1
    `);
    return rows.length === 0;
  }
  const { rows } = await db.execute(sql`
    SELECT 1 FROM user_preferences WHERE username = ${username} LIMIT 1
  `);
  return rows.length === 0;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

/** Upsert user_preferences — creates the row if it doesn't exist yet. */
export async function updateProfile(userId, { displayName, username, profileImageUrl, bio }) {
  const { rows } = await db.execute(sql`
    INSERT INTO user_preferences (user_id, display_name, username, profile_image_url, bio, updated_at)
    VALUES (${userId}, ${displayName ?? null}, ${username ?? null}, ${profileImageUrl ?? null}, ${bio ?? null}, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      display_name      = COALESCE(EXCLUDED.display_name,      user_preferences.display_name),
      username          = COALESCE(EXCLUDED.username,          user_preferences.username),
      profile_image_url = COALESCE(EXCLUDED.profile_image_url, user_preferences.profile_image_url),
      bio               = COALESCE(EXCLUDED.bio,               user_preferences.bio),
      updated_at        = NOW()
    RETURNING *
  `);
  return rows[0] ?? null;
}

/** Replace notification settings atomically (DELETE + INSERT). */
export async function updateNotificationSettings(userId, { emailNotifications, pushNotifications, commentNotifications, marketingEmails }) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`DELETE FROM user_notification_settings WHERE user_id = ${userId}`);
    const { rows: [settings] } = await tx.execute(sql`
      INSERT INTO user_notification_settings
        (user_id, email_notifications, push_notifications, comment_notifications, marketing_emails)
      VALUES (${userId}, ${emailNotifications ?? true}, ${pushNotifications ?? true}, ${commentNotifications ?? true}, ${marketingEmails ?? false})
      RETURNING *
    `);
    return settings;
  });
}

/** Replace category preferences atomically (DELETE + INSERT). */
export async function updateCategoryPreferences(userId, categoryIds) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`DELETE FROM user_category_preferences WHERE user_id = ${userId}`);
    for (const catId of categoryIds) {
      await tx.execute(sql`
        INSERT INTO user_category_preferences (user_id, category_id)
        VALUES (${userId}, ${catId})
        ON CONFLICT DO NOTHING
      `);
    }
    return { userId, count: categoryIds.length };
  });
}

/**
 * Delete the account: sessions + auth rows in FK order so cascade wipes everything.
 * ON DELETE CASCADE from "user" propagates to comparison_sets, votes, reviews, etc.
 */
export async function deleteAccount(userId) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`DELETE FROM session WHERE user_id = ${userId}`);
    await tx.execute(sql`DELETE FROM account WHERE user_id = ${userId}`);
    const { rows } = await tx.execute(sql`DELETE FROM "user" WHERE id = ${userId} RETURNING id`);
    return rows[0] ?? null;
  });
}
