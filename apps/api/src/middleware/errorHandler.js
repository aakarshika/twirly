import { logger } from '../lib/logger.js';

export function errorHandler(err, req, res, _next) {
  const status = err.status ?? err.statusCode ?? 500;

  if (status >= 500) {
    logger.error({ err, reqId: req.id, path: req.originalUrl }, 'Unhandled error');
  }

  res.status(status).json({
    error: {
      message: err.expose ? err.message : status >= 500 ? 'Internal server error' : err.message,
      code: err.code ?? (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
    },
  });
}

export function notFoundHandler(req, res, next) {
  next(Object.assign(new Error(`Not found: ${req.method} ${req.originalUrl}`), {
    status: 404,
    expose: true,
    code: 'NOT_FOUND',
  }));
}
