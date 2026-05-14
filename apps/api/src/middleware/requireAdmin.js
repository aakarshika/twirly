import createError from 'http-errors';
import { env } from '../config/env.js';

const adminIds = new Set(
  (env.ADMIN_USER_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
);

export function requireAdmin(req, res, next) {
  if (!req.user) return next(createError(401, 'Authentication required'));
  if (!adminIds.has(req.user.id)) return next(createError(403, 'Admin access required'));
  return next();
}
