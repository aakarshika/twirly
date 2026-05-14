import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/auth.js', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

const { auth } = await import('../config/auth.js');
const { requireAuth } = await import('./requireAuth.js');

function makeReq(headers = {}) {
  return { headers };
}

describe('requireAuth', () => {
  beforeEach(() => {
    auth.api.getSession.mockReset();
  });

  it('calls next with 401 when no session is returned', async () => {
    auth.api.getSession.mockResolvedValueOnce(null);
    const req = makeReq();
    const next = vi.fn();

    await requireAuth(req, {}, next);

    expect(next).toHaveBeenCalledOnce();
    const err = next.mock.calls[0][0];
    expect(err.status).toBe(401);
    expect(req.user).toBeUndefined();
  });

  it('populates req.user / req.session and calls next() on a valid session', async () => {
    const user = { id: 'u1', email: 'a@b.com' };
    const session = { id: 's1', userId: 'u1' };
    auth.api.getSession.mockResolvedValueOnce({ user, session });
    const req = makeReq({ cookie: 'session=abc' });
    const next = vi.fn();

    await requireAuth(req, {}, next);

    expect(req.user).toBe(user);
    expect(req.session).toBe(session);
    expect(next).toHaveBeenCalledWith();
  });

  it('forwards an unexpected error to next()', async () => {
    const boom = new Error('upstream down');
    auth.api.getSession.mockRejectedValueOnce(boom);
    const next = vi.fn();

    await requireAuth(makeReq(), {}, next);

    expect(next).toHaveBeenCalledWith(boom);
  });
});
