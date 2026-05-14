import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

export async function logActivity({ userId, activityType, entityType, entityId, karmaPoints = 0, pageName = '', metadata = {} }) {
  const { rows } = await db.execute(sql`
    INSERT INTO user_activity_log (user_id, activity_type, entity_type, entity_id, karma_points, page_name, metadata)
    VALUES (${userId}, ${activityType}, ${entityType}, ${entityId}, ${karmaPoints}, ${pageName}, ${JSON.stringify(metadata)})
    RETURNING id, user_id, activity_type, entity_type, entity_id, karma_points, page_name, metadata, created_at
  `);
  return rows[0] ?? null;
}

export async function getUserActivities(userId, limit = 10) {
  const { rows } = await db.execute(sql`
    SELECT id, user_id, activity_type, entity_type, entity_id, karma_points, page_name, metadata, created_at
    FROM user_activity_log
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `);
  return rows;
}

export async function getWeeklyActivity(userId) {
  const { rows } = await db.execute(sql`
    SELECT DATE(created_at AT TIME ZONE 'UTC')::text AS date, COUNT(*)::int AS count
    FROM user_activity_log
    WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '7 days'
    GROUP BY date ORDER BY date
  `);
  return rows;
}

export async function getActivityTrends(userId) {
  const { rows } = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int  AS current_week,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days'
                         AND created_at <  NOW() - INTERVAL '7 days')::int  AS previous_week
    FROM user_activity_log
    WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '14 days'
  `);
  const row = rows[0] ?? { current_week: 0, previous_week: 0 };
  const prev = row.previous_week || 0;
  const curr = row.current_week || 0;
  const change = prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100);
  return {
    weeklyActivity: curr,
    weeklyChangePercentage: change,
    currentWeekActivity: curr,
    previousWeekActivity: prev,
  };
}

export async function getActivityCount(userId) {
  const { rows } = await db.execute(sql`
    SELECT COUNT(*)::int AS total
    FROM user_activity_log
    WHERE user_id = ${userId}
  `);
  return rows[0]?.total ?? 0;
}
