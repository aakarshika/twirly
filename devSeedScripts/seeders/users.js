import { q } from '../db.js';
import { PERSONAS, SHARED_PASSWORD } from '../data/personas.js';

const API_BASE = process.env.BETTER_AUTH_URL ?? 'http://localhost:8734';
const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Wipes all persona-owned data plus global seed items so the seed is fully
 * idempotent. Deletes in dependency order; the final DELETE on "user" cascades
 * to account, session, user_preferences, and user_notification_settings.
 */
export async function wipePreviousPersonaData(itemNames) {
  const emails    = PERSONAS.map(p => p.email);
  const usernames = PERSONAS.map(p => p.username);

  // Clear conflicting username claims from ANY user (not just persona emails)
  const uPlaceholders = usernames.map((_, i) => `$${i + 1}`).join(', ');
  await q(`DELETE FROM user_preferences WHERE username IN (${uPlaceholders})`, usernames);

  // Get current user IDs for persona emails (if any)
  const ePlaceholders = emails.map((_, i) => `$${i + 1}`).join(', ');
  const { rows: existingUsers } = await q(
    `SELECT id FROM "user" WHERE email IN (${ePlaceholders})`,
    emails,
  );

  if (existingUsers.length) {
    const ids = existingUsers.map(r => r.id);
    const idP = ids.map((_, i) => `$${i + 1}`).join(', ');
    await q(`DELETE FROM votes                      WHERE user_id IN (${idP})`, ids);
    await q(`DELETE FROM reviews                    WHERE user_id IN (${idP})`, ids);
    await q(`DELETE FROM comparison_set_comments    WHERE user_id IN (${idP})`, ids);
    await q(`DELETE FROM comparison_sets            WHERE user_id IN (${idP})`, ids);
    await q(`DELETE FROM user_category_preferences  WHERE user_id IN (${idP})`, ids);
    await q(`DELETE FROM user_notification_settings WHERE user_id IN (${idP})`, ids);
    // Cascades to: account, session, user_preferences
    await q(`DELETE FROM "user" WHERE id IN (${idP})`, ids);
    console.log(`  wiped ${ids.length} previous persona user(s)`);
  } else {
    console.log('  no previous persona users found');
  }

  // Wipe global seed items (no user_id, matched by name).
  // Items have no unique constraint on name, so duplicates accumulate across
  // runs — delete them all and re-insert fresh with current image_url / color.
  const iPlaceholders = itemNames.map((_, i) => `$${i + 1}`).join(', ');
  const { rowCount } = await q(
    `DELETE FROM items WHERE name IN (${iPlaceholders}) AND user_id IS NULL`,
    itemNames,
  );
  console.log(`  wiped ${rowCount} previous seed item(s)`);
}

export async function createUserViaApi(persona) {
  await sleep(1200); // avoid Better Auth rate-limit on rapid consecutive sign-ups
  const res = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5734' },
    body: JSON.stringify({ email: persona.email, password: SHARED_PASSWORD, name: persona.name }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`sign-up failed for ${persona.email} (${res.status}): ${body}`);
  }
  const data = await res.json();
  const userId = data?.user?.id;
  if (!userId) throw new Error(`Unexpected sign-up response for ${persona.email}: ${JSON.stringify(data)}`);
  console.log(`  created: ${persona.email}`);
  return userId;
}

export async function insertUserPreferences(userId, persona) {
  await q(
    `INSERT INTO user_preferences (user_id, display_name, username, bio, created_at, updated_at)
     VALUES ($1, $2, $3, $4, now(), now())
     ON CONFLICT (user_id) DO UPDATE
       SET display_name = EXCLUDED.display_name,
           username     = EXCLUDED.username,
           bio          = EXCLUDED.bio,
           updated_at   = now()`,
    [userId, persona.displayName, persona.username, persona.bio],
  );

  // user_notification_settings has no unique constraint on user_id — delete+insert.
  // created_at is set 1 hour in the past so created_at !== updated_at, which the
  // app uses to detect that the user has completed onboarding (they saved prefs).
  await q(`DELETE FROM user_notification_settings WHERE user_id = $1`, [userId]);
  await q(
    `INSERT INTO user_notification_settings
       (user_id, email_notifications, push_notifications, comment_notifications, marketing_emails,
        created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, now() - interval '1 hour', now())`,
    [userId, persona.notifications.email, persona.notifications.push,
     persona.notifications.comment, persona.notifications.marketing],
  );
}

export async function applyCategoryPreferences(userId, persona, catIds) {
  for (const cat of persona.interests) {
    const catId = catIds[cat];
    if (!catId) continue;
    await q(
      `INSERT INTO user_category_preferences (user_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, catId],
    );
  }
}
