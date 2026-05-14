import { describe, it, expect, vi } from 'vitest';
import { requireOwner } from './requireOwner.js';

function run(getResource, { params = { id: '42' }, user = { id: 'u1' } } = {}) {
  const req = { params, user };
  const next = vi.fn();
  return { req, next, mw: requireOwner(getResource) };
}

describe('requireOwner', () => {
  it('401 when the request is unauthenticated', async () => {
    const getResource = vi.fn();
    const { mw, next } = run(getResource, { user: undefined });
    await mw({ params: { id: '42' } }, {}, next);
    expect(next.mock.calls[0][0].status).toBe(401);
    expect(getResource).not.toHaveBeenCalled();
  });

  it('404 when the resource is not found', async () => {
    const getResource = vi.fn().mockResolvedValue(null);
    const { req, next, mw } = run(getResource);
    await mw(req, {}, next);
    expect(next.mock.calls[0][0].status).toBe(404);
  });

  it('403 when the resource belongs to another user', async () => {
    const getResource = vi.fn().mockResolvedValue({ id: '42', userId: 'someone-else' });
    const { req, next, mw } = run(getResource);
    await mw(req, {}, next);
    expect(next.mock.calls[0][0].status).toBe(403);
  });

  it('attaches the resource and calls next() when the owner matches', async () => {
    const resource = { id: '42', userId: 'u1' };
    const getResource = vi.fn().mockResolvedValue(resource);
    const { req, next, mw } = run(getResource);
    await mw(req, {}, next);
    expect(req.resource).toBe(resource);
    expect(next).toHaveBeenCalledWith();
  });

  it('forwards loader errors to next()', async () => {
    const boom = new Error('db unavailable');
    const getResource = vi.fn().mockRejectedValue(boom);
    const { req, next, mw } = run(getResource);
    await mw(req, {}, next);
    expect(next).toHaveBeenCalledWith(boom);
  });
});
