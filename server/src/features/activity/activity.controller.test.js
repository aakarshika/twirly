import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./activity.queries.js', () => ({
  logActivity: vi.fn(),
  getUserActivities: vi.fn(),
  getActivityCount: vi.fn(),
}));

const mocks = await import('./activity.queries.js');
const { log, list, count } = await import('./activity.controller.js');

const user = { id: 'u1' };
function makeRes() {
  const res = { json: vi.fn().mockReturnThis(), status: vi.fn().mockReturnThis() };
  res.status.mockReturnValue(res);
  return res;
}

beforeEach(() => Object.values(mocks).forEach((m) => m.mockReset?.()));

describe('log', () => {
  it('creates activity and returns 201', async () => {
    const row = { id: 1, user_id: 'u1' };
    mocks.logActivity.mockResolvedValueOnce(row);
    const res = makeRes();
    await log({ user, body: { activityType: 'vote', entityType: 'comparison_set', entityId: 3 } }, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: row });
  });

  it('returns 400 when required fields missing', async () => {
    const next = vi.fn();
    await log({ user, body: { activityType: 'vote' } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it('forwards db errors', async () => {
    mocks.logActivity.mockRejectedValueOnce(new Error('db fail'));
    const next = vi.fn();
    await log({ user, body: { activityType: 'vote', entityType: 'comparison_set', entityId: 1 } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db fail' }));
  });
});

describe('list', () => {
  it('returns activity rows', async () => {
    mocks.getUserActivities.mockResolvedValueOnce([{ id: 1 }]);
    const res = makeRes();
    await list({ user, query: {} }, res, vi.fn());
    expect(res.json).toHaveBeenCalledWith({ data: [{ id: 1 }] });
  });

  it('returns 400 for invalid limit', async () => {
    const next = vi.fn();
    await list({ user, query: { limit: 'bad' } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it('forwards db errors', async () => {
    mocks.getUserActivities.mockRejectedValueOnce(new Error('db fail'));
    const next = vi.fn();
    await list({ user, query: {} }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db fail' }));
  });
});

describe('count', () => {
  it('returns total count', async () => {
    mocks.getActivityCount.mockResolvedValueOnce(5);
    const res = makeRes();
    await count({ user, query: {} }, res, vi.fn());
    expect(res.json).toHaveBeenCalledWith({ data: { total: 5 } });
  });

  it('forwards db errors', async () => {
    mocks.getActivityCount.mockRejectedValueOnce(new Error('db fail'));
    const next = vi.fn();
    await count({ user, query: {} }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db fail' }));
  });
});
