import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

export async function getUserKarma(userId) {
  const { rows } = await db.execute(
    sql`SELECT total_karma_points FROM karma_points WHERE user_id = ${userId} LIMIT 1`
  );
  return rows[0] ?? { total_karma_points: 0 };
}

export async function getMultipleUsersKarma(userIds) {
  if (!userIds.length) return [];
  const { rows } = await db.execute(
    sql`SELECT user_id, total_karma_points FROM karma_points WHERE user_id = ANY(${userIds})`
  );
  return rows;
}
