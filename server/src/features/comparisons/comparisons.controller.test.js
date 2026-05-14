import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./comparisons.queries.js', () => ({
  getComparisonSetById:    vi.fn(),
  getFullComparison:       vi.fn(),
  getAllComparisons:        vi.fn(),
  getUserComparisons:      vi.fn(),
  getUnpublishedComparison:vi.fn(),
  createComparison:        vi.fn(),
  updateComparison:        vi.fn(),
  updateItems:             vi.fn(),
  updateAspects:           vi.fn(),
  deleteComparisonSet:     vi.fn(),
  likeSet:                 vi.fn(),
  unlikeSet:               vi.fn(),
}));

// eslint-disable-next-line no-unused-vars
vi.mock('../comments/comments.controller.js', () => ({
  listComments:  vi.fn(),
  createComment: vi.fn(),
}));

let queries;
let getAllSetsHandler, getUserSetsHandler, getUnpublishedHandler, getSetHandler;
let createSet, updateSet, deleteSet, updateItemsHandler, updateAspectsHandler;
let likeSetHandler, unlikeSetHandler;

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json   = vi.fn().mockReturnValue(res);
  res.end    = vi.fn().mockReturnValue(res);
  return res;
};
const next = vi.fn();

beforeEach(async () => {
  vi.resetAllMocks();
  queries = await import('./comparisons.queries.js');
  ({
    getAllSetsHandler, getUserSetsHandler, getUnpublishedHandler, getSetHandler,
    createSet, updateSet, deleteSet, updateItemsHandler, updateAspectsHandler,
    likeSetHandler, unlikeSetHandler,
  } = await import('./comparisons.controller.js'));
});

// ---------------------------------------------------------------------------
describe('getAllSetsHandler', () => {
  it('returns list of sets', async () => {
    queries.getAllComparisons.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
    const req = { query: {} };
    const res = mockRes();
    await getAllSetsHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: [{ id: 1 }, { id: 2 }] });
  });
});

describe('getUserSetsHandler', () => {
  it('returns user comparisons', async () => {
    queries.getUserComparisons.mockResolvedValueOnce([{ id: 3 }]);
    const req = { params: { userId: 'u1' } };
    const res = mockRes();
    await getUserSetsHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: [{ id: 3 }] });
  });
});

describe('getUnpublishedHandler', () => {
  it('returns draft when found', async () => {
    const draft = { id: 5, is_published: false };
    queries.getUnpublishedComparison.mockResolvedValueOnce(draft);
    const req = { user: { id: 'u1' } };
    const res = mockRes();
    await getUnpublishedHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: draft });
  });

  it('calls next(404) when no draft found', async () => {
    queries.getUnpublishedComparison.mockResolvedValueOnce(null);
    const req = { user: { id: 'u1' } };
    const res = mockRes();
    await getUnpublishedHandler(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
  });
});

describe('getSetHandler', () => {
  it('returns full comparison when found', async () => {
    const set = { id: 1, name: 'My Set' };
    queries.getFullComparison.mockResolvedValueOnce(set);
    const req = { params: { id: '1' } };
    const res = mockRes();
    await getSetHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: set });
  });

  it('calls next(404) when not found', async () => {
    queries.getFullComparison.mockResolvedValueOnce(null);
    const req = { params: { id: '999' } };
    const res = mockRes();
    await getSetHandler(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
  });

  it('calls next(400) for non-numeric id', async () => {
    const req = { params: { id: 'abc' } };
    const res = mockRes();
    await getSetHandler(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });
});

describe('createSet', () => {
  it('creates and returns 201', async () => {
    const created = { id: 1, name: 'Test' };
    queries.createComparison.mockResolvedValueOnce(created);
    const req = {
      user: { id: 'u1' },
      body: { name: 'Test', isPublished: false, itemIds: [10], aspects: [] },
    };
    const res = mockRes();
    await createSet(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: created });
  });

  it('returns 400 on validation failure', async () => {
    const req = { user: { id: 'u1' }, body: { name: '' } }; // empty name fails
    const res = mockRes();
    await createSet(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });
});

describe('updateSet', () => {
  it('updates and returns the set', async () => {
    const updated = { id: 1, name: 'Updated' };
    queries.updateComparison.mockResolvedValueOnce(updated);
    const req = {
      user: { id: 'u1' },
      params: { id: '1' },
      body: { name: 'Updated' },
    };
    const res = mockRes();
    await updateSet(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: updated });
  });

  it('calls next(404) when set not found', async () => {
    queries.updateComparison.mockResolvedValueOnce(null);
    const req = { user: { id: 'u1' }, params: { id: '999' }, body: { name: 'X' } };
    const res = mockRes();
    await updateSet(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
  });
});

describe('deleteSet', () => {
  it('returns 204 on success', async () => {
    queries.deleteComparisonSet.mockResolvedValueOnce({ id: 1 });
    const req = { params: { id: '1' } };
    const res = mockRes();
    await deleteSet(req, res, next);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  it('calls next(404) when not found', async () => {
    queries.deleteComparisonSet.mockResolvedValueOnce(null);
    const req = { params: { id: '999' } };
    const res = mockRes();
    await deleteSet(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
  });
});

describe('updateItemsHandler', () => {
  it('replaces items and returns result', async () => {
    queries.updateItems.mockResolvedValueOnce({ setId: 1, count: 2 });
    const req = { params: { id: '1' }, body: { itemIds: [5, 6] } };
    const res = mockRes();
    await updateItemsHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: { setId: 1, count: 2 } });
  });
});

describe('updateAspectsHandler', () => {
  it('upserts aspects and returns result', async () => {
    queries.updateAspects.mockResolvedValueOnce({ setId: 1, count: 1 });
    const req = {
      params: { id: '1' },
      body: { aspects: [{ metricName: 'Quality', weight: 1 }] },
    };
    const res = mockRes();
    await updateAspectsHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: { setId: 1, count: 1 } });
  });
});

describe('likeSetHandler', () => {
  it('returns like result', async () => {
    queries.likeSet.mockResolvedValueOnce({ added: true });
    const req = { user: { id: 'u1' }, params: { id: '1' } };
    const res = mockRes();
    await likeSetHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: { added: true } });
  });
});

describe('unlikeSetHandler', () => {
  it('returns unlike result', async () => {
    queries.unlikeSet.mockResolvedValueOnce({ removed: true });
    const req = { user: { id: 'u1' }, params: { id: '1' } };
    const res = mockRes();
    await unlikeSetHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: { removed: true } });
  });
});
