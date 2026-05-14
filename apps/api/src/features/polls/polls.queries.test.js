import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/db.js', () => ({ db: { execute: vi.fn() } }));

const { db } = await import('../../config/db.js');
const { getUserPolls } = await import('./polls.queries.js');

beforeEach(() => db.execute.mockReset());

describe('getUserPolls', () => {
  it('returns formatted poll rows', async () => {
    const rows = [
      { id: 1, title: 'iOS vs Android', date: '2026-01-01', status: 'active', category: 'Tech', votes: 5 },
    ];
    db.execute.mockResolvedValueOnce({ rows });
    const result = await getUserPolls('u1');
    expect(result).toEqual(rows);
    expect(db.execute).toHaveBeenCalledOnce();
  });

  it('returns empty array when user has no polls', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    const result = await getUserPolls('u1');
    expect(result).toEqual([]);
  });

  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db down'));
    await expect(getUserPolls('u1')).rejects.toThrow('db down');
  });
});
