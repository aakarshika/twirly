import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../../config/auth.js';
import { authLimiter, registerLimiter, forgotPasswordLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

// Rate limits applied to the specific Better Auth endpoints that need them.
// These run before the catch-all handler below.
router.use('/sign-in/email', authLimiter);
router.use('/sign-in/username', authLimiter);
router.use('/sign-up/email', registerLimiter);
router.use('/forget-password', forgotPasswordLimiter);

// Better Auth handles ALL /api/auth/* endpoints. The host app must not parse the
// JSON body for these routes — Better Auth's handler reads the raw stream — so this
// router is mounted BEFORE express.json() in app.js.
router.all('/*splat', toNodeHandler(auth));

export const authRouter = router;
