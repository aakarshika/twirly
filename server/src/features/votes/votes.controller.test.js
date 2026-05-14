import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./votes.queries.js', () => ({
  getUserVotes: vi.fn(),
  getVoteForSet: vi.fn(),
  getVoteCount: vi.fn(),
  castVote: vi.fn(),
  updateVote: vi.fn(),
  revertVote: vi.fn(),
  revertVoteBySetId: vi.fn(),
  getVoteById: vi.fn(),
}));

const mocks = await import('./votes.queries.js');
const {
  listUserVotes, checkVote, voteCount, createVote,
  changeVote, deleteVote, deleteVoteBySetId,
} = await import('./votes.controller.js');

const user = { id: 'u1' };
function makeRes() { return { json: vi.fn().mockReturnThis(), status: vi.fn().mockReturnThis(), end: vi.fn() }; }

beforeEach(() => Object.values(mocks).forEach(m => m.mockReset?.()));

describe('listUserVotes', () => {
  it('returns votes for the auth user', async () => {
    mocks.getUserVotes.mockResolvedValueOnce([{ id: 1 }]);
    const res = makeRes();
    await listUserVotes({ user }, res, vi.fn());
    expect(mocks.getUserVotes).toHaveBeenCalledWith('u1');
    expect(res.json).toHaveBeenCalledWith({ data: [{ id: 1 }] });
  });
  it('forwards db errors', async () => {
    mocks.getUserVotes.mockRejectedValueOnce(new Error('db down'));
    const next = vi.fn();
    await listUserVotes({ user }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db down' }));
  });
});

describe('checkVote', () => {
  it('returns vote row when found', async () => {
    mocks.getVoteForSet.mockResolvedValueOnce({ id: 3 });
    const res = makeRes();
    await checkVote({ user, query: { setId: '2' } }, res, vi.fn());
    expect(res.json).toHaveBeenCalledWith({ data: { id: 3 } });
  });
  it('returns 400 when setId is missing', async () => {
    const next = vi.fn();
    await checkVote({ user, query: {} }, makeRes(), next);
    expect(next.mock.calls[0][0].status).toBe(400);
  });
});

describe('voteCount', () => {
  it('returns count object', async () => {
    mocks.getVoteCount.mockResolvedValueOnce(5);
    const res = makeRes();
    await voteCount({ query: { setId: '1', itemId: '2' } }, res, vi.fn());
    expect(res.json).toHaveBeenCalledWith({ data: { count: 5 } });
  });
  it('returns 400 when params missing', async () => {
    const next = vi.fn();
    await voteCount({ query: {} }, makeRes(), next);
    expect(next.mock.calls[0][0].status).toBe(400);
  });
});

describe('createVote', () => {
  it('inserts and returns new vote when none exists', async () => {
    mocks.getVoteForSet.mockResolvedValueOnce(null);
    mocks.castVote.mockResolvedValueOnce({ id: 7, user_id: 'u1', set_id: 1, item_id: 2 });
    const res = makeRes();
    await createVote({ user, body: { setId: 1, itemId: 2 } }, res, vi.fn());
    expect(mocks.castVote).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('updates existing vote when one already exists', async () => {
    mocks.getVoteForSet.mockResolvedValueOnce({ id: 5 });
    mocks.updateVote.mockResolvedValueOnce({ id: 5, item_id: 3 });
    const res = makeRes();
    await createVote({ user, body: { setId: 1, itemId: 3 } }, res, vi.fn());
    expect(mocks.updateVote).toHaveBeenCalledWith(5, 3);
  });

  it('returns 400 on invalid body', async () => {
    const next = vi.fn();
    await createVote({ user, body: { setId: 'bad' } }, makeRes(), next);
    expect(next.mock.calls[0][0].status).toBe(400);
  });
});

describe('deleteVote', () => {
  it('deletes vote by id and returns 204', async () => {
    mocks.revertVote.mockResolvedValueOnce({ id: 1 });
    const res = makeRes();
    await deleteVote({ user, params: { id: '1' }, resource: { userId: 'u1' } }, res, vi.fn());
    expect(mocks.revertVote).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(204);
  });
});

describe('deleteVoteBySetId', () => {
  it('deletes by userId+setId and returns 204', async () => {
    mocks.revertVoteBySetId.mockResolvedValueOnce({ id: 1 });
    const res = makeRes();
    await deleteVoteBySetId({ user, query: { setId: '2' } }, res, vi.fn());
    expect(mocks.revertVoteBySetId).toHaveBeenCalledWith('u1', 2);
    expect(res.status).toHaveBeenCalledWith(204);
  });
  it('returns 400 when setId missing', async () => {
    const next = vi.fn();
    await deleteVoteBySetId({ user, query: {} }, makeRes(), next);
    expect(next.mock.calls[0][0].status).toBe(400);
  });
});
