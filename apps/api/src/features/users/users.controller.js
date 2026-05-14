import createError from 'http-errors';
import { z } from 'zod';
import {
  getUserProfile,
  getUserByUsername,
  getActivitySummary,
  getNotificationSettings,
  getCategoryPreferences,
  checkUsernameAvailability,
  updateProfile,
  updateNotificationSettings,
  updateCategoryPreferences,
  deleteAccount,
} from './users.queries.js';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const updateProfileSchema = z.object({
  displayName:     z.string().min(1).max(255).optional(),
  username:        z.string().min(3).max(100).regex(/^[a-zA-Z0-9_]+$/, 'letters, numbers, underscores only').optional(),
  profileImageUrl: z.string().url().max(1000).optional(),
  bio:             z.string().max(500).optional(),
});

const notificationSchema = z.object({
  emailNotifications:   z.boolean().optional(),
  pushNotifications:    z.boolean().optional(),
  commentNotifications: z.boolean().optional(),
  marketingEmails:      z.boolean().optional(),
});

const categoryPrefsSchema = z.object({
  categoryIds: z.array(z.number().int().positive()).max(20),
});

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function getUserProfileHandler(req, res, next) {
  try {
    const profile = await getUserProfile(req.params.id);
    if (!profile) throw createError(404, 'User not found');
    res.json({ data: profile });
  } catch (err) { next(err); }
}

export async function getActivitySummaryHandler(req, res, next) {
  try {
    const summary = await getActivitySummary(req.params.id);
    res.json({ data: summary });
  } catch (err) { next(err); }
}

export async function updateProfileHandler(req, res, next) {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) throw createError(400, parsed.error.flatten());

    // If username is being set, verify availability (exclude self)
    if (parsed.data.username) {
      const available = await checkUsernameAvailability(parsed.data.username, req.user.id);
      if (!available) throw createError(409, 'Username already taken');
    }

    const updated = await updateProfile(req.user.id, parsed.data);
    res.json({ data: updated });
  } catch (err) { next(err); }
}

export async function getNotificationsHandler(req, res, next) {
  try {
    const settings = await getNotificationSettings(req.user.id);
    res.json({ data: settings });
  } catch (err) { next(err); }
}

export async function updateNotificationsHandler(req, res, next) {
  try {
    const parsed = notificationSchema.safeParse(req.body);
    if (!parsed.success) throw createError(400, parsed.error.flatten());
    const settings = await updateNotificationSettings(req.user.id, parsed.data);
    res.json({ data: settings });
  } catch (err) { next(err); }
}

export async function getCategoryPrefsHandler(req, res, next) {
  try {
    const prefs = await getCategoryPreferences(req.user.id);
    res.json({ data: prefs });
  } catch (err) { next(err); }
}

export async function updateCategoryPrefsHandler(req, res, next) {
  try {
    const parsed = categoryPrefsSchema.safeParse(req.body);
    if (!parsed.success) throw createError(400, parsed.error.flatten());
    const result = await updateCategoryPreferences(req.user.id, parsed.data.categoryIds);
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function checkUsernameHandler(req, res, next) {
  try {
    const { username } = req.query;
    if (!username || username.trim().length < 3) throw createError(400, 'username query param required (min 3 chars)');
    const available = await checkUsernameAvailability(username.trim(), req.user?.id ?? null);
    res.json({ data: { available } });
  } catch (err) { next(err); }
}

export async function getUserByUsernameHandler(req, res, next) {
  try {
    const { username } = req.params;
    if (!username) throw createError(400, 'username param required');
    const user = await getUserByUsername(username);
    if (!user) throw createError(404, 'User not found');
    res.json({ data: user });
  } catch (err) { next(err); }
}

export async function deleteAccountHandler(req, res, next) {
  try {
    const deleted = await deleteAccount(req.user.id);
    if (!deleted) throw createError(404, 'User not found');
    res.status(204).end();
  } catch (err) { next(err); }
}
