import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';

import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { healthRouter } from './features/health/health.routes.js';
import { authRouter } from './features/auth/auth.routes.js';
import { trendingRouter, setsRouter } from './features/trending/trending.routes.js';
import { karmaRouter } from './features/karma/karma.routes.js';
import { searchRouter } from './features/search/search.routes.js';
import { pollsRouter } from './features/polls/polls.routes.js';
import { votesRouter } from './features/votes/votes.routes.js';
import { commentsRouter } from './features/comments/comments.routes.js';
import { comparisonsRouter } from './features/comparisons/comparisons.routes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));

  // Better Auth reads the raw request stream, so mount it BEFORE express.json().
  app.use('/api/auth', authRouter);

  app.use(express.json({ limit: '1mb' }));

  app.use('/api/health', healthRouter);
  app.use('/api/trending', trendingRouter);
  app.use('/api/sets', setsRouter);
  app.use('/api/karma', karmaRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/polls', pollsRouter);
  app.use('/api/votes', votesRouter);
  app.use('/api/comments', commentsRouter);
  app.use('/api/comparisons', comparisonsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
