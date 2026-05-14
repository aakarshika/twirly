import { Resend } from 'resend';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const stub = {
  emails: {
    send: async (payload) => {
      logger.warn(
        { to: payload.to, subject: payload.subject },
        'RESEND_API_KEY not set — email send stubbed (logged only)'
      );
      return { id: 'stub', to: payload.to };
    },
  },
};

export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : stub;
