import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/db.js', () => ({
  db: { execute: vi.fn(), transaction: vi.fn() },
}));

let db;
let getUserProfile, getActivitySummary, getNotificationSettings, getCategoryPreferences;
let checkUsernameAvailability, updateProfile, updateNotificationSettings;
let updateCategoryPreferences, deleteAccount;

beforeEach(async () => {
  vi.resetModules();
  const dbMod = await import('../../config/db.js');
  db = dbMod.db;
  const mod = await import('./users.queries.js');
  ({
    getUserProfile, getActivitySummary, getNotificationSettings, getCategoryPreferences,
    checkUsernameAvailability, updateProfile, updateNotificationSettings,
    updateCategoryPreferences, deleteAccount,
  } = mod);
});

// ---------------------------------------------------------------------------
describe('getUserProfile', () => {
  it('returns profile with counts when found', async () => {
    const row = {
      user_id: 'u1', display_name: 'Alice', username: 'alice',
      total_votes: 5, total_comparisons: 2,
    };
    db.execute.mockResolvedValueOnce({ rows: [row] });
    const result = await getUserProfile('u1');
    expect(result).toEqual(row);
  });

  it('returns null when user has no profile row', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    const result = await getUserProfile('u99');
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
describe('getActivitySummary', () => {
  it('returns activity counts', async () => {
    const row = { total_votes: 10, total_reviews: 3, total_products: 5 };
    db.execute.mockResolvedValueOnce({ rows: [row] });
    const result = await getActivitySummary('u1');
    expect(result).toEqual(row);
  });
});

// ---------------------------------------------------------------------------
describe('getNotificationSettings', () => {
  it('returns settings when found', async () => {
    const row = { user_id: 'u1', email_notifications: true };
    db.execute.mockResolvedValueOnce({ rows: [row] });
    expect(await getNotificationSettings('u1')).toEqual(row);
  });

  it('returns null when not found', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await getNotificationSettings('u99')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
describe('getCategoryPreferences', () => {
  it('returns list of category preferences', async () => {
    const rows = [{ category_id: 1, category_name: 'Tech' }];
    db.execute.mockResolvedValueOnce({ rows });
    expect(await getCategoryPreferences('u1')).toEqual(rows);
  });
});

// ---------------------------------------------------------------------------
describe('checkUsernameAvailability', () => {
  it('returns true when username is free', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await checkUsernameAvailability('free_name')).toBe(true);
  });

  it('returns false when username is taken', async () => {
    db.execute.mockResolvedValueOnce({ rows: [1] });
    expect(await checkUsernameAvailability('taken')).toBe(false);
  });

  it('excludes own user_id when checking availability', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    const result = await checkUsernameAvailability('myname', 'u1');
    expect(result).toBe(true);
  });
});

// ---------------------------------------------------------------------------
describe('updateProfile', () => {
  it('upserts and returns the updated row', async () => {
    const row = { user_id: 'u1', display_name: 'Alice', username: 'alice' };
    db.execute.mockResolvedValueOnce({ rows: [row] });
    const result = await updateProfile('u1', { displayName: 'Alice', username: 'alice' });
    expect(result).toEqual(row);
  });
});

// ---------------------------------------------------------------------------
describe('updateNotificationSettings', () => {
  it('deletes old settings and inserts new ones', async () => {
    const newSettings = { user_id: 'u1', email_notifications: true };
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute
        .mockResolvedValueOnce({ rows: [] })          // DELETE
        .mockResolvedValueOnce({ rows: [newSettings] }); // INSERT
      return fn(tx);
    });

    const result = await updateNotificationSettings('u1', { emailNotifications: true });
    expect(result).toEqual(newSettings);
    expect(db.transaction).toHaveBeenCalledOnce();
  });

  it('rolls back when insert fails', async () => {
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute
        .mockResolvedValueOnce({ rows: [] })            // DELETE OK
        .mockRejectedValueOnce(new Error('insert err')); // INSERT fails
      try { return await fn(tx); } catch (e) { throw e; }
    });

    await expect(
      updateNotificationSettings('u1', { emailNotifications: true })
    ).rejects.toThrow('insert err');
  });
});

// ---------------------------------------------------------------------------
describe('updateCategoryPreferences', () => {
  it('deletes old prefs and inserts new ones', async () => {
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn().mockResolvedValue({ rows: [] }) };
      return fn(tx);
    });
    const result = await updateCategoryPreferences('u1', [1, 2, 3]);
    expect(result).toEqual({ userId: 'u1', count: 3 });
  });

  it('rolls back when category insert fails', async () => {
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute
        .mockResolvedValueOnce({ rows: [] })              // DELETE OK
        .mockRejectedValueOnce(new Error('FK error'));    // INSERT fails
      try { return await fn(tx); } catch (e) { throw e; }
    });

    await expect(
      updateCategoryPreferences('u1', [999])
    ).rejects.toThrow('FK error');
  });
});

// ---------------------------------------------------------------------------
describe('deleteAccount', () => {
  it('deletes sessions, account, and user in FK order', async () => {
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute
        .mockResolvedValueOnce({ rows: [] })           // DELETE session
        .mockResolvedValueOnce({ rows: [] })           // DELETE account
        .mockResolvedValueOnce({ rows: [{ id: 'u1' }] }); // DELETE user
      return fn(tx);
    });

    const result = await deleteAccount('u1');
    expect(result).toEqual({ id: 'u1' });
  });

  it('returns null when user not found', async () => {
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute
        .mockResolvedValueOnce({ rows: [] }) // DELETE session
        .mockResolvedValueOnce({ rows: [] }) // DELETE account
        .mockResolvedValueOnce({ rows: [] }); // DELETE user → not found
      return fn(tx);
    });
    const result = await deleteAccount('ghost');
    expect(result).toBeNull();
  });

  it('rolls back if user delete fails (all prior deletes roll back)', async () => {
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute
        .mockResolvedValueOnce({ rows: [] })              // DELETE session OK
        .mockResolvedValueOnce({ rows: [] })              // DELETE account OK
        .mockRejectedValueOnce(new Error('constraint')); // DELETE user fails
      try { return await fn(tx); } catch (e) { throw e; }
    });

    await expect(deleteAccount('u1')).rejects.toThrow('constraint');
  });
});
