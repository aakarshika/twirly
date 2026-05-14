import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/db.js', () => ({ db: { execute: vi.fn() } }));

const { db } = await import('../../config/db.js');
const {
  getComments, getUserComments, postComment, postReply,
  getCommentById, addReaction, removeReaction,
} = await import('./comments.queries.js');

beforeEach(() => db.execute.mockReset());

describe('getComments', () => {
  it('returns comments and total', async () => {
    db.execute
      .mockResolvedValueOnce({ rows: [{ id: 1, content: 'hi', reactions: [], replies: [] }] })
      .mockResolvedValueOnce({ rows: [{ total: 5 }] });
    const result = await getComments(42, 1, 10);
    expect(result.comments).toHaveLength(1);
    expect(result.total).toBe(5);
  });
  it('returns empty array when no comments', async () => {
    db.execute
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] });
    const result = await getComments(42);
    expect(result.comments).toEqual([]);
    expect(result.total).toBe(0);
  });
  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db down'));
    await expect(getComments(1)).rejects.toThrow('db down');
  });
});

describe('getUserComments', () => {
  it('returns user comments with set info', async () => {
    db.execute
      .mockResolvedValueOnce({ rows: [{ id: 1, content: 'test', set_name: 'Poll' }] })
      .mockResolvedValueOnce({ rows: [{ total: 1 }] });
    const result = await getUserComments('u1');
    expect(result.comments[0]).toMatchObject({ set_name: 'Poll' });
  });
  it('returns zero total when user has no comments', async () => {
    db.execute
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] });
    const result = await getUserComments('u1');
    expect(result.total).toBe(0);
  });
});

describe('postComment', () => {
  it('returns inserted comment row', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ id: 10, content: 'hello', set_id: 5 }] });
    const row = await postComment(5, 'u1', 'hello');
    expect(row).toMatchObject({ id: 10, content: 'hello' });
  });
  it('returns null when insert returns nothing', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await postComment(5, 'u1', 'test')).toBeNull();
  });
});

describe('postReply', () => {
  it('returns reply row with parent_id', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ id: 20, parent_id: 10 }] });
    const row = await postReply(10, 'u1', 'reply text');
    expect(row.parent_id).toBe(10);
  });
  it('returns null when parent comment does not exist', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await postReply(999, 'u1', 'reply')).toBeNull();
  });
});

describe('getCommentById', () => {
  it('returns comment with userId alias', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ id: 1, userId: 'u1' }] });
    expect(await getCommentById(1)).toMatchObject({ userId: 'u1' });
  });
  it('returns null when not found', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await getCommentById(999)).toBeNull();
  });
});

describe('addReaction', () => {
  it('executes insert without error', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    await expect(addReaction(1, 'u1', 'like')).resolves.not.toThrow();
  });
  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('constraint'));
    await expect(addReaction(1, 'u1', 'like')).rejects.toThrow('constraint');
  });
});

describe('removeReaction', () => {
  it('executes delete without error', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    await expect(removeReaction(1, 'u1')).resolves.not.toThrow();
  });
});
