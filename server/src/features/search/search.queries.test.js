import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/db.js', () => ({ db: { execute: vi.fn() } }));

const { db } = await import('../../config/db.js');
const { searchSets, searchItems, searchUsers } = await import('./search.queries.js');

beforeEach(() => db.execute.mockReset());

describe('searchSets', () => {
  it('returns rows from the db', async () => {
    const rows = [{ set_id: 1, set_name: 'iPhone vs Android' }];
    db.execute.mockResolvedValueOnce({ rows });
    const result = await searchSets('iphone');
    expect(result).toEqual(rows);
    expect(db.execute).toHaveBeenCalledOnce();
  });

  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db down'));
    await expect(searchSets('test')).rejects.toThrow('db down');
  });
});

describe('searchItems', () => {
  it('returns rows from the db', async () => {
    const rows = [{ id: 1, name: 'iPhone 15' }];
    db.execute.mockResolvedValueOnce({ rows });
    const result = await searchItems('iphone');
    expect(result).toEqual(rows);
  });

  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db down'));
    await expect(searchItems('test')).rejects.toThrow('db down');
  });
});

describe('searchUsers', () => {
  it('returns rows from the db', async () => {
    const rows = [{ user_id: 'u1', display_name: 'Alice' }];
    db.execute.mockResolvedValueOnce({ rows });
    const result = await searchUsers('alice');
    expect(result).toEqual(rows);
  });

  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db down'));
    await expect(searchUsers('test')).rejects.toThrow('db down');
  });
});
