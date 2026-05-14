import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/db.js', () => ({ db: { execute: vi.fn() } }));

const { db } = await import('../../config/db.js');
const { getUserKarma, getMultipleUsersKarma } = await import('./karma.queries.js');

beforeEach(() => db.execute.mockReset());

describe('getUserKarma', () => {
  it('returns the row when a match exists', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ total_karma_points: 42 }] });
    const result = await getUserKarma('user1');
    expect(result).toEqual({ total_karma_points: 42 });
  });

  it('returns { total_karma_points: 0 } when no row exists', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    const result = await getUserKarma('user1');
    expect(result).toEqual({ total_karma_points: 0 });
  });

  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db down'));
    await expect(getUserKarma('user1')).rejects.toThrow('db down');
  });
});

describe('getMultipleUsersKarma', () => {
  it('returns mapped rows', async () => {
    const rows = [
      { user_id: 'u1', total_karma_points: 10 },
      { user_id: 'u2', total_karma_points: 20 },
    ];
    db.execute.mockResolvedValueOnce({ rows });
    const result = await getMultipleUsersKarma(['u1', 'u2']);
    expect(result).toEqual(rows);
  });

  it('returns [] without hitting db when userIds is empty', async () => {
    const result = await getMultipleUsersKarma([]);
    expect(result).toEqual([]);
    expect(db.execute).not.toHaveBeenCalled();
  });

  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db down'));
    await expect(getMultipleUsersKarma(['u1'])).rejects.toThrow('db down');
  });
});
