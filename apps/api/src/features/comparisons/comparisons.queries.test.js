import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/db.js', () => ({
  db: { execute: vi.fn(), transaction: vi.fn() },
}));

let db;
let createComparison, updateComparison, updateItems, updateAspects;
let getFullComparison, getAllComparisons, getUserComparisons, getUnpublishedComparison;
let deleteComparisonSet, likeSet, unlikeSet, getComparisonSetById;

beforeEach(async () => {
  vi.resetModules();
  const dbMod = await import('../../config/db.js');
  db = dbMod.db;
  const mod = await import('./comparisons.queries.js');
  ({
    createComparison, updateComparison, updateItems, updateAspects,
    getFullComparison, getAllComparisons, getUserComparisons, getUnpublishedComparison,
    deleteComparisonSet, likeSet, unlikeSet, getComparisonSetById,
  } = mod);
});

// ---------------------------------------------------------------------------
// getComparisonSetById
// ---------------------------------------------------------------------------
describe('getComparisonSetById', () => {
  it('returns the row when found', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ id: 1, userId: 'u1' }] });
    const result = await getComparisonSetById(1);
    expect(result).toEqual({ id: 1, userId: 'u1' });
  });

  it('returns null when not found', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    const result = await getComparisonSetById(999);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getFullComparison
// ---------------------------------------------------------------------------
describe('getFullComparison', () => {
  it('returns null when set not found', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    const result = await getFullComparison(999);
    expect(result).toBeNull();
  });

  it('returns the set with nested items and aspects', async () => {
    const row = {
      id: 1, name: 'My Set', is_published: true,
      comparison_set_items: [{ id: 10, item_id: 5, items: { id: 5, name: 'Item A' } }],
      comparison_set_aspects: [{ id: 2, metric_name: 'Quality', weight: 1 }],
    };
    db.execute.mockResolvedValueOnce({ rows: [row] });
    const result = await getFullComparison(1);
    expect(result).toEqual(row);
  });
});

// ---------------------------------------------------------------------------
// getAllComparisons
// ---------------------------------------------------------------------------
describe('getAllComparisons', () => {
  it('returns a list of published comparisons', async () => {
    const rows = [{ id: 1, name: 'Set A' }, { id: 2, name: 'Set B' }];
    db.execute.mockResolvedValueOnce({ rows });
    const result = await getAllComparisons(20);
    expect(result).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// getUserComparisons
// ---------------------------------------------------------------------------
describe('getUserComparisons', () => {
  it('returns user comparisons', async () => {
    const rows = [{ id: 1, user_id: 'u1', name: 'My Set' }];
    db.execute.mockResolvedValueOnce({ rows });
    const result = await getUserComparisons('u1');
    expect(result).toEqual(rows);
  });
});

// ---------------------------------------------------------------------------
// getUnpublishedComparison
// ---------------------------------------------------------------------------
describe('getUnpublishedComparison', () => {
  it('returns null when no draft exists', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    const result = await getUnpublishedComparison('u1');
    expect(result).toBeNull();
  });

  it('returns the draft when found', async () => {
    const draft = { id: 5, user_id: 'u1', is_published: false, comparison_set_aspects: [] };
    db.execute.mockResolvedValueOnce({ rows: [draft] });
    const result = await getUnpublishedComparison('u1');
    expect(result).toEqual(draft);
  });
});

// ---------------------------------------------------------------------------
// createComparison — transaction + rollback
// ---------------------------------------------------------------------------
describe('createComparison', () => {
  it('inserts set, items, and aspects inside a transaction', async () => {
    const setRow = { id: 1, user_id: 'u1', name: 'Test', is_published: false };
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute
        .mockResolvedValueOnce({ rows: [setRow] }) // INSERT comparison_sets
        .mockResolvedValue({ rows: [] });            // INSERT items + INSERT aspects
      return fn(tx);
    });

    const result = await createComparison({
      userId: 'u1', name: 'Test', isPublished: false,
      itemIds: [10, 20],
      aspects: [{ metricName: 'Quality', description: 'Good', weight: 1 }],
    });

    expect(result).toEqual(setRow);
    expect(db.transaction).toHaveBeenCalledOnce();
  });

  it('rolls back when item insert fails', async () => {
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT comparison_sets OK
        .mockRejectedValueOnce(new Error('FK violation')); // INSERT item fails
      return fn(tx);
    });

    await expect(
      createComparison({ userId: 'u1', name: 'Test', itemIds: [10], aspects: [] })
    ).rejects.toThrow('FK violation');
  });

  it('rolls back when aspect insert fails', async () => {
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // INSERT set OK
        .mockResolvedValueOnce({ rows: [] })             // INSERT item OK
        .mockRejectedValueOnce(new Error('aspect error')); // INSERT aspect fails
      return fn(tx);
    });

    await expect(
      createComparison({
        userId: 'u1', name: 'Test', itemIds: [10],
        aspects: [{ metricName: 'Q', weight: 1 }],
      })
    ).rejects.toThrow('aspect error');
  });
});

// ---------------------------------------------------------------------------
// updateComparison — transaction
// ---------------------------------------------------------------------------
describe('updateComparison', () => {
  it('updates set metadata and replaces items and aspects', async () => {
    const updatedSet = { id: 1, name: 'Updated', is_published: true };
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute
        .mockResolvedValueOnce({ rows: [updatedSet] }) // UPDATE comparison_sets
        .mockResolvedValueOnce({ rows: [] })             // DELETE items
        .mockResolvedValueOnce({ rows: [] })             // INSERT item
        .mockResolvedValueOnce({ rows: [{ id: 2 }] })   // SELECT existing aspects
        .mockResolvedValue({ rows: [] });                // UPDATE/INSERT aspects
      return fn(tx);
    });

    const result = await updateComparison(1, {
      name: 'Updated', isPublished: true,
      itemIds: [10],
      aspects: [{ id: 2, metricName: 'Quality', weight: 2 }],
    });

    expect(result).toEqual(updatedSet);
  });

  it('returns null when set not found', async () => {
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute.mockResolvedValueOnce({ rows: [] }); // UPDATE returns nothing
      return fn(tx);
    });

    const result = await updateComparison(999, { name: 'X' });
    expect(result).toBeNull();
  });

  it('rolls back on item replace failure', async () => {
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // UPDATE OK
        .mockRejectedValueOnce(new Error('delete failed')); // DELETE items fails
      return fn(tx);
    });

    await expect(
      updateComparison(1, { itemIds: [10] })
    ).rejects.toThrow('delete failed');
  });
});

// ---------------------------------------------------------------------------
// updateItems
// ---------------------------------------------------------------------------
describe('updateItems', () => {
  it('deletes old items and inserts new ones', async () => {
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn().mockResolvedValue({ rows: [] }) };
      return fn(tx);
    });

    const result = await updateItems(1, [5, 6]);
    expect(result).toEqual({ setId: 1, count: 2 });
  });
});

// ---------------------------------------------------------------------------
// updateAspects
// ---------------------------------------------------------------------------
describe('updateAspects', () => {
  it('upserts aspects and deletes removed ones', async () => {
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute
        .mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] }) // SELECT existing
        .mockResolvedValue({ rows: [] }); // DELETE + UPDATE/INSERT
      return fn(tx);
    });

    // keep id:1, delete id:2, add new (no id)
    const result = await updateAspects(5, [
      { id: 1, metricName: 'Quality', weight: 1 },
      { metricName: 'Speed', weight: 2 },
    ]);
    expect(result).toEqual({ setId: 5, count: 2 });
  });
});

// ---------------------------------------------------------------------------
// deleteComparisonSet
// ---------------------------------------------------------------------------
describe('deleteComparisonSet', () => {
  it('returns the deleted row', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const result = await deleteComparisonSet(1);
    expect(result).toEqual({ id: 1 });
  });

  it('returns null when not found', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    const result = await deleteComparisonSet(999);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// likeSet / unlikeSet
// ---------------------------------------------------------------------------
describe('likeSet', () => {
  it('returns { added: true } on new like', async () => {
    db.execute.mockResolvedValueOnce({ rows: [1] });
    expect(await likeSet(1, 'u1')).toEqual({ added: true });
  });

  it('returns { alreadyLiked: true } on conflict', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await likeSet(1, 'u1')).toEqual({ alreadyLiked: true });
  });
});

describe('unlikeSet', () => {
  it('returns { removed: true } when like existed', async () => {
    db.execute.mockResolvedValueOnce({ rows: [1] });
    expect(await unlikeSet(1, 'u1')).toEqual({ removed: true });
  });

  it('returns { notLiked: true } when no like existed', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await unlikeSet(1, 'u1')).toEqual({ notLiked: true });
  });
});
