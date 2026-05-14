import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/db.js', () => ({
  db: { execute: vi.fn() },
}));

const { db } = await import('../../config/db.js');
const { logActivity, getUserActivities, getActivityCount } = await import('./activity.queries.js');

beforeEach(() => db.execute.mockReset());

describe('logActivity', () => {
  it('inserts and returns the new row', async () => {
    const row = { id: 1, user_id: 'u1', activity_type: 'vote', entity_type: 'comparison_set', entity_id: 5 };
    db.execute.mockResolvedValueOnce({ rows: [row] });
    const result = await logActivity({ userId: 'u1', activityType: 'vote', entityType: 'comparison_set', entityId: 5 });
    expect(result).toEqual(row);
    expect(db.execute).toHaveBeenCalledOnce();
  });

  it('returns null when no rows returned', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    const result = await logActivity({ userId: 'u1', activityType: 'vote', entityType: 'comparison_set', entityId: 1 });
    expect(result).toBeNull();
  });

  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db fail'));
    await expect(logActivity({ userId: 'u1', activityType: 'vote', entityType: 'comparison_set', entityId: 1 })).rejects.toThrow('db fail');
  });
});

describe('getUserActivities', () => {
  it('returns rows ordered by created_at', async () => {
    const rows = [{ id: 2 }, { id: 1 }];
    db.execute.mockResolvedValueOnce({ rows });
    const result = await getUserActivities('u1', 5);
    expect(result).toEqual(rows);
  });

  it('returns empty array when no activity', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    const result = await getUserActivities('u1');
    expect(result).toEqual([]);
  });

  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db fail'));
    await expect(getUserActivities('u1')).rejects.toThrow('db fail');
  });
});

describe('getActivityCount', () => {
  it('returns total count', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ total: 7 }] });
    const total = await getActivityCount('u1');
    expect(total).toBe(7);
  });

  it('returns 0 when no rows', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    const total = await getActivityCount('u1');
    expect(total).toBe(0);
  });

  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db fail'));
    await expect(getActivityCount('u1')).rejects.toThrow('db fail');
  });
});
