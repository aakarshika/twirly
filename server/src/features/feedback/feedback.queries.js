import { sql } from 'drizzle-orm';
import { db } from '../../config/db.js';

export async function listFeedback() {
  const { rows } = await db.execute(sql`
    SELECT id, name, type, priority, message, image_url, status, page_route, created_at
    FROM feedback
    ORDER BY created_at DESC
  `);
  return rows;
}

export async function getFeedback(id) {
  const { rows } = await db.execute(sql`
    SELECT id, name, type, priority, message, image_url, status, page_route, created_at
    FROM feedback
    WHERE id = ${id}
    LIMIT 1
  `);
  return rows[0] ?? null;
}

export async function submitFeedback({ name, type, priority, message, imageUrl, pageRoute }) {
  const { rows } = await db.execute(sql`
    INSERT INTO feedback (name, type, priority, message, image_url, status, page_route)
    VALUES (${name ?? ''}, ${type ?? 'bug'}, ${priority ?? 'medium'}, ${message}, ${imageUrl ?? null}, 'pending', ${pageRoute ?? ''})
    RETURNING id, name, type, priority, message, image_url, status, page_route, created_at
  `);
  return rows[0] ?? null;
}

export async function updateFeedbackStatus(id, status) {
  const { rows } = await db.execute(sql`
    UPDATE feedback SET status = ${status} WHERE id = ${id}
    RETURNING id, status
  `);
  return rows[0] ?? null;
}

export async function deleteFeedback(id) {
  await db.execute(sql`DELETE FROM feedback WHERE id = ${id}`);
}
