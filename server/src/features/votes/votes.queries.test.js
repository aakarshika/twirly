import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/db.js', () => ({ db: { execute: vi.fn() } }));

const { db } = await import('../../config/db.js');
const {
  getVoteById, getVoteForSet, getUserVotes, getVoteCount,
  castVote, updateVote, revertVote, revertVoteBySetId,
} = await import('./votes.queries.js');

beforeEach(() => db.execute.mockReset());

describe('getVoteById', () => {
  it('returns vote with userId alias', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ id: 1, userId: 'u1', set_id: 2, item_id: 3 }] });
    expect(await getVoteById(1)).toMatchObject({ userId: 'u1' });
  });
  it('returns null when not found', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await getVoteById(99)).toBeNull();
  });
});

describe('getVoteForSet', () => {
  it('returns vote row when exists', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    expect(await getVoteForSet('u1', 2)).toMatchObject({ id: 1 });
  });
  it('returns null when not found', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await getVoteForSet('u1', 99)).toBeNull();
  });
  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db down'));
    await expect(getVoteForSet('u1', 2)).rejects.toThrow('db down');
  });
});

describe('getUserVotes', () => {
  it('returns enriched rows', async () => {
    const rows = [{ id: 1, title: 'iOS vs Android', voted_for: 'iPhone', category: 'Tech' }];
    db.execute.mockResolvedValueOnce({ rows });
    expect(await getUserVotes('u1')).toEqual(rows);
  });
  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db down'));
    await expect(getUserVotes('u1')).rejects.toThrow('db down');
  });
});

describe('getVoteCount', () => {
  it('returns count', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ count: 7 }] });
    expect(await getVoteCount(1, 2)).toBe(7);
  });
  it('returns 0 when no votes', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await getVoteCount(1, 2)).toBe(0);
  });
});

describe('castVote', () => {
  it('returns inserted row', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ id: 5, user_id: 'u1', set_id: 1, item_id: 2 }] });
    const result = await castVote({ userId: 'u1', setId: 1, itemId: 2 });
    expect(result.id).toBe(5);
  });
  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db down'));
    await expect(castVote({ userId: 'u1', setId: 1, itemId: 2 })).rejects.toThrow('db down');
  });
});

describe('revertVote', () => {
  it('returns deleted row', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    expect(await revertVote(1)).toMatchObject({ id: 1 });
  });
  it('returns null when not found', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await revertVote(99)).toBeNull();
  });
});
