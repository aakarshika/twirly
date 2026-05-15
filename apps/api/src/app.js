import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { swaggerSpec } from './config/swagger.js';
import { healthRouter } from './features/health/health.routes.js';
import { authRouter } from './features/auth/auth.routes.js';
import { trendingRouter, setsRouter } from './features/trending/trending.routes.js';
import { karmaRouter } from './features/karma/karma.routes.js';
import { searchRouter } from './features/search/search.routes.js';
import { pollsRouter } from './features/polls/polls.routes.js';
import { votesRouter } from './features/votes/votes.routes.js';
import { commentsRouter } from './features/comments/comments.routes.js';
import { comparisonsRouter } from './features/comparisons/comparisons.routes.js';
import { reviewsRouter } from './features/reviews/reviews.routes.js';
import { itemsRouter } from './features/items/items.routes.js';
import { productsRouter } from './features/products/products.routes.js';
import { categoriesRouter } from './features/categories/categories.routes.js';
import { usersRouter } from './features/users/users.routes.js';
import { activityRouter } from './features/activity/activity.routes.js';
import { feedbackRouter } from './features/feedback/feedback.routes.js';
import { uploadsRouter } from './features/uploads/uploads.routes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src':   ["'self'", 'data:', 'https:'],
      },
    },
  }));
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
  app.use(cookieParser());
  app.use(pinoHttp({
    logger,
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'debug';
    },
    serializers: {
      req: req => ({ id: req.id, method: req.method, url: req.url }),
      res: res => ({ statusCode: res.statusCode }),
    },
  }));

  // Swagger UI documentation.
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  }));

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
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/items', itemsRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/activity', activityRouter);
  app.use('/api/feedback', feedbackRouter);
  app.use('/api/uploads', uploadsRouter);

  // Serve locally-uploaded files.
  app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
