import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./search.queries.js', () => ({
  searchSets: vi.fn(),
  searchItems: vi.fn(),
  searchUsers: vi.fn(),
}));

const { searchSets, searchItems, searchUsers } = await import('./search.queries.js');
const { search } = await import('./search.controller.js');

function makeRes() {
  return { json: vi.fn().mockReturnThis() };
}

beforeEach(() => {
  searchSets.mockReset();
  searchItems.mockReset();
  searchUsers.mockReset();
});

describe('search', () => {
  it('calls all three queries and returns merged result for type=all', async () => {
    searchSets.mockResolvedValueOnce([{ set_id: 1 }]);
    searchItems.mockResolvedValueOnce([{ id: 2 }]);
    searchUsers.mockResolvedValueOnce([{ user_id: 'u1' }]);
    const req = { query: { q: 'test' } };
    const res = makeRes();
    await search(req, res, vi.fn());
    expect(res.json).toHaveBeenCalledWith({
      data: { sets: [{ set_id: 1 }], items: [{ id: 2 }], users: [{ user_id: 'u1' }] },
    });
  });

  it('calls only searchSets for type=sets', async () => {
    searchSets.mockResolvedValueOnce([]);
    const req = { query: { q: 'test', type: 'sets' } };
    const res = makeRes();
    await search(req, res, vi.fn());
    expect(searchItems).not.toHaveBeenCalled();
    expect(searchUsers).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ data: [] });
  });

  it('returns 400 when q is missing', async () => {
    const next = vi.fn();
    await search({ query: {} }, makeRes(), next);
    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0][0].status).toBe(400);
  });

  it('returns 400 for invalid type', async () => {
    const next = vi.fn();
    await search({ query: { q: 'x', type: 'bogus' } }, makeRes(), next);
    expect(next.mock.calls[0][0].status).toBe(400);
  });

  it('forwards db errors to next()', async () => {
    searchSets.mockRejectedValueOnce(new Error('db down'));
    searchItems.mockResolvedValueOnce([]);
    searchUsers.mockResolvedValueOnce([]);
    const next = vi.fn();
    await search({ query: { q: 'test' } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db down' }));
  });
});
