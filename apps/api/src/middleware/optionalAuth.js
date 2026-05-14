import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../config/auth.js';

/** Attaches req.user if a valid session exists; never rejects the request. */
export async function optionalAuth(req, res, next) {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (session) {
      req.user = session.user;
      req.session = session.session;
    }
  } catch {
    // ignore — unauthenticated requests are fine here
  }
  return next();
}
