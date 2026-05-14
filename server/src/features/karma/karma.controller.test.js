import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./karma.queries.js', () => ({
  getUserKarma: vi.fn(),
  getMultipleUsersKarma: vi.fn(),
}));

const { getUserKarma, getMultipleUsersKarma } = await import('./karma.queries.js');
const { getKarma } = await import('./karma.controller.js');

function makeRes() {
  return { json: vi.fn().mockReturnThis() };
}

beforeEach(() => {
  getUserKarma.mockReset();
  getMultipleUsersKarma.mockReset();
});

describe('getKarma', () => {
  it('returns single user karma when userId is provided', async () => {
    getUserKarma.mockResolvedValueOnce({ total_karma_points: 5 });
    const req = { query: { userId: 'u1' } };
    const res = makeRes();
    await getKarma(req, res, vi.fn());
    expect(getUserKarma).toHaveBeenCalledWith('u1');
    expect(res.json).toHaveBeenCalledWith({ data: { total_karma_points: 5 } });
  });

  it('returns multiple users karma when userIds[] is provided', async () => {
    const rows = [{ user_id: 'u1', total_karma_points: 10 }];
    getMultipleUsersKarma.mockResolvedValueOnce(rows);
    const req = { query: { 'userIds[]': ['u1'] } };
    const res = makeRes();
    await getKarma(req, res, vi.fn());
    expect(getMultipleUsersKarma).toHaveBeenCalledWith(['u1']);
    expect(res.json).toHaveBeenCalledWith({ data: rows });
  });

  it('calls next(400) when neither userId nor userIds[] is supplied', async () => {
    const req = { query: {} };
    const next = vi.fn();
    await getKarma(req, makeRes(), next);
    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0][0].status).toBe(400);
  });

  it('forwards db errors to next()', async () => {
    getUserKarma.mockRejectedValueOnce(new Error('db down'));
    const next = vi.fn();
    await getKarma({ query: { userId: 'u1' } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db down' }));
  });
});
