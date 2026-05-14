import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/db.js', () => ({
  db: { execute: vi.fn(), transaction: vi.fn() },
}));

const { db } = await import('../../config/db.js');
const {
  getProduct, getProductById, getUserProducts, searchProducts,
  createProduct, updateProduct, deleteProduct,
} = await import('./products.queries.js');

beforeEach(() => {
  db.execute.mockReset();
  db.transaction.mockReset();
});

describe('getProduct', () => {
  it('returns product with categories', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ id: 1, name: 'A', categories: [] }] });
    expect(await getProduct(1)).toMatchObject({ id: 1, name: 'A' });
  });
  it('returns null when not found', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await getProduct(99)).toBeNull();
  });
});

describe('getProductById', () => {
  it('returns row with userId alias', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ id: 1, userId: 'u1' }] });
    expect(await getProductById(1)).toMatchObject({ userId: 'u1' });
  });
  it('returns null when missing', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await getProductById(99)).toBeNull();
  });
});

describe('getUserProducts', () => {
  it('returns list for userId', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] });
    const result = await getUserProducts('u1');
    expect(result).toHaveLength(2);
  });
  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db down'));
    await expect(getUserProducts('u1')).rejects.toThrow('db down');
  });
});

describe('searchProducts', () => {
  it('returns matching products', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Apple' }] });
    expect(await searchProducts('App')).toHaveLength(1);
  });
  it('returns empty array when nothing matches', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await searchProducts('zzz')).toEqual([]);
  });
});

describe('createProduct', () => {
  it('inserts item and category mappings in a transaction', async () => {
    const item = { id: 5, name: 'New', categories: [] };
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute.mockResolvedValueOnce({ rows: [item] }); // INSERT items
      tx.execute.mockResolvedValue({ rows: [] });          // INSERT item_categories
      return fn(tx);
    });
    const result = await createProduct('u1', { name: 'New', categoryIds: [1, 2] });
    expect(result).toMatchObject({ id: 5, name: 'New' });
  });

  it('rolls back when category insert fails', async () => {
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute.mockResolvedValueOnce({ rows: [{ id: 5 }] }); // items insert ok
      tx.execute.mockRejectedValueOnce(new Error('fk violation')); // category insert fails
      return fn(tx);
    });
    await expect(createProduct('u1', { name: 'Boom', categoryIds: [999] }))
      .rejects.toThrow('fk violation');
  });
});

describe('updateProduct', () => {
  it('updates item and replaces categories', async () => {
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Updated' }] }); // UPDATE
      tx.execute.mockResolvedValue({ rows: [] }); // DELETE + INSERT
      return fn(tx);
    });
    const result = await updateProduct(1, { name: 'Updated', categoryIds: [2] });
    expect(result).toMatchObject({ name: 'Updated' });
  });

  it('returns null when item not found', async () => {
    db.transaction.mockImplementationOnce(async (fn) => {
      const tx = { execute: vi.fn() };
      tx.execute.mockResolvedValueOnce({ rows: [] });
      return fn(tx);
    });
    expect(await updateProduct(99, { name: 'X' })).toBeNull();
  });
});

describe('deleteProduct', () => {
  it('returns deleted row', async () => {
    db.execute.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    expect(await deleteProduct(1)).toMatchObject({ id: 1 });
  });
  it('returns null when not found', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await deleteProduct(99)).toBeNull();
  });
});
