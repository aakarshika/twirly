import createError from 'http-errors';
import { logActivity, getUserActivities, getActivityCount, getWeeklyActivity, getActivityTrends } from './activity.queries.js';

export async function log(req, res, next) {
  try {
    const { activityType, entityType, entityId, karmaPoints, pageName, metadata } = req.body;
    if (!activityType || !entityType || entityId == null) {
      throw createError(400, 'activityType, entityType, and entityId are required');
    }
    const row = await logActivity({
      userId: req.user.id,
      activityType,
      entityType,
      entityId,
      karmaPoints,
      pageName,
      metadata,
    });
    res.status(201).json({ data: row });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const userId = req.query.userId ?? req.user.id;
    const limit = Math.min(parseInt(req.query.limit ?? '20', 10), 100);
    if (!Number.isFinite(limit) || limit < 1) throw createError(400, 'Invalid limit');
    const rows = await getUserActivities(userId, limit);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

export async function count(req, res, next) {
  try {
    const userId = req.query.userId ?? req.user.id;
    const total = await getActivityCount(userId);
    res.json({ data: { total } });
  } catch (err) {
    next(err);
  }
}

export async function weekly(req, res, next) {
  try {
    const userId = req.query.userId ?? req.user.id;
    const rows = await getWeeklyActivity(userId);
    res.json({ data: rows });
  } catch (err) { next(err); }
}

export async function trends(req, res, next) {
  try {
    const userId = req.query.userId ?? req.user.id;
    const result = await getActivityTrends(userId);
    res.json({ data: result });
  } catch (err) { next(err); }
}
