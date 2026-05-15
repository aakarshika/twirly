import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { randomUUID } from 'node:crypto';

import { db } from './db.js';
import { env } from './env.js';
import { resend } from '../lib/mailer.js';

const socialProviders = {};
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  advanced: {
    generateId: () => randomUUID(),
  },

  // Relax rate limits in non-production so the dev seed script can create all
  // 6 personas in one run without hitting Better Auth's default special rules
  // (which cap /sign-up and /sign-in at 3 req / 10 s regardless of the global max).
  rateLimit: process.env.NODE_ENV !== 'production'
    ? {
        window: 60,
        max: 100,
        customRules: {
          '/sign-up/*': false,
          '/sign-in/*': false,
        },
      }
    : undefined,

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: env.EMAIL_FROM ?? 'noreply@twirly.local',
        to: user.email,
        subject: 'Reset your Twirly password',
        html: `<p>Click to reset your password:</p><p><a href="${url}">${url}</a></p>`,
      });
    },
  },

  socialProviders,

  trustedOrigins: [env.FRONTEND_URL],
});
