import rateLimit from 'express-rate-limit';

const message = { error: { message: 'Too many attempts, please try again later', code: 'RATE_LIMITED' } };

// In dev, skip rate limiting for loopback requests (seed script, local testing).
const skipLocalhost = process.env.NODE_ENV !== 'production'
  ? (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1'
  : undefined;

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message,
  skip: skipLocalhost,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message,
  skip: skipLocalhost,
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message,
  skip: skipLocalhost,
});
