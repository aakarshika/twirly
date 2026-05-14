import { describe, it, expect, vi, beforeEach } from 'vitest';
import createHttpError from 'http-errors';
import { errorHandler, notFoundHandler } from './errorHandler.js';

function makeRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('formats an http-errors object with its status and message (exposed)', () => {
    const err = createHttpError(404, 'Comparison not found', { code: 'NOT_FOUND' });
    const res = makeRes();

    errorHandler(err, { id: 'r1', originalUrl: '/x' }, res, () => {});

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Comparison not found', code: 'NOT_FOUND' },
    });
  });

  it('hides internal errors behind a generic message on 500', () => {
    const err = new Error('boom — leak this and we lose');
    const res = makeRes();

    errorHandler(err, { id: 'r2', originalUrl: '/y' }, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    const payload = res.json.mock.calls[0][0];
    expect(payload.error.message).toBe('Internal server error');
    expect(payload.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('notFoundHandler', () => {
  it('forwards a 404 http-error to next', () => {
    const next = vi.fn();
    notFoundHandler({ method: 'GET', originalUrl: '/missing' }, makeRes(), next);

    expect(next).toHaveBeenCalledOnce();
    const err = next.mock.calls[0][0];
    expect(err.status).toBe(404);
    expect(err.expose).toBe(true);
    expect(err.code).toBe('NOT_FOUND');
  });
});
