import createError from 'http-errors';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../config/auth.js';

export async function requireAuth(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) return next(createError(401, 'Authentication required'));
    req.user = session.user;
    req.session = session.session;
    return next();
  } catch (err) {
    return next(err);
  }
}
