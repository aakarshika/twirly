import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./polls.queries.js', () => ({ getUserPolls: vi.fn() }));

const { getUserPolls } = await import('./polls.queries.js');
const { getPolls } = await import('./polls.controller.js');

function makeRes() {
  return { json: vi.fn().mockReturnThis() };
}

beforeEach(() => getUserPolls.mockReset());

describe('getPolls', () => {
  it('returns polls for the authenticated user', async () => {
    const polls = [{ id: 1, title: 'iOS vs Android', votes: 3 }];
    getUserPolls.mockResolvedValueOnce(polls);
    const req = { user: { id: 'u1' } };
    const res = makeRes();
    await getPolls(req, res, vi.fn());
    expect(getUserPolls).toHaveBeenCalledWith('u1');
    expect(res.json).toHaveBeenCalledWith({ data: polls });
  });

  it('forwards db errors to next()', async () => {
    getUserPolls.mockRejectedValueOnce(new Error('db down'));
    const next = vi.fn();
    await getPolls({ user: { id: 'u1' } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db down' }));
  });
});
