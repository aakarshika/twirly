import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./comments.queries.js', () => ({
  getComments: vi.fn(),
  getUserComments: vi.fn(),
  postComment: vi.fn(),
  postReply: vi.fn(),
  addReaction: vi.fn(),
  removeReaction: vi.fn(),
}));

const mocks = await import('./comments.queries.js');
const {
  listComments, createComment, createReply,
  addReactionHandler, removeReactionHandler, listUserComments,
} = await import('./comments.controller.js');

const user = { id: 'u1' };
function makeRes() {
  const res = { json: vi.fn().mockReturnThis(), status: vi.fn().mockReturnThis() };
  res.status.mockReturnValue(res);
  return res;
}

beforeEach(() => Object.values(mocks).forEach(m => m.mockReset?.()));

describe('listComments', () => {
  it('returns paginated comments', async () => {
    mocks.getComments.mockResolvedValueOnce({ comments: [{ id: 1 }], total: 1 });
    const res = makeRes();
    await listComments({ params: { setId: '5' }, query: {} }, res, vi.fn());
    expect(mocks.getComments).toHaveBeenCalledWith(5, 1, 10);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ total: 1 }) }));
  });
  it('returns 400 for invalid setId', async () => {
    const next = vi.fn();
    await listComments({ params: { setId: 'bad' }, query: {} }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });
  it('forwards db errors', async () => {
    mocks.getComments.mockRejectedValueOnce(new Error('db error'));
    const next = vi.fn();
    await listComments({ params: { setId: '1' }, query: {} }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db error' }));
  });
});

describe('createComment', () => {
  it('creates and returns 201 with comment', async () => {
    mocks.postComment.mockResolvedValueOnce({ id: 10, content: 'hello' });
    const res = makeRes();
    await createComment({ user, params: { setId: '5' }, body: { content: 'hello' } }, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: { id: 10, content: 'hello' } });
  });
  it('returns 400 for empty content', async () => {
    const next = vi.fn();
    await createComment({ user, params: { setId: '5' }, body: { content: '' } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });
  it('returns 400 for invalid setId', async () => {
    const next = vi.fn();
    await createComment({ user, params: { setId: 'x' }, body: { content: 'hi' } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });
});

describe('createReply', () => {
  it('creates reply and returns 201', async () => {
    mocks.postReply.mockResolvedValueOnce({ id: 20, parent_id: 10 });
    const res = makeRes();
    await createReply({ user, params: { id: '10' }, body: { content: 'reply' } }, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(201);
  });
  it('returns 404 when parent comment missing', async () => {
    mocks.postReply.mockResolvedValueOnce(null);
    const next = vi.fn();
    await createReply({ user, params: { id: '10' }, body: { content: 'hi' } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
  });
});

describe('addReactionHandler', () => {
  it('adds reaction and responds', async () => {
    mocks.addReaction.mockResolvedValueOnce(undefined);
    const res = makeRes();
    await addReactionHandler({ user, params: { id: '1' }, body: {} }, res, vi.fn());
    expect(res.json).toHaveBeenCalledWith({ data: { added: true } });
  });
  it('forwards errors', async () => {
    mocks.addReaction.mockRejectedValueOnce(new Error('fail'));
    const next = vi.fn();
    await addReactionHandler({ user, params: { id: '1' }, body: {} }, makeRes(), next);
    expect(next).toHaveBeenCalled();
  });
});

describe('removeReactionHandler', () => {
  it('removes reaction and responds', async () => {
    mocks.removeReaction.mockResolvedValueOnce(undefined);
    const res = makeRes();
    await removeReactionHandler({ user, params: { id: '1' } }, res, vi.fn());
    expect(res.json).toHaveBeenCalledWith({ data: { removed: true } });
  });
});

describe('listUserComments', () => {
  it('returns user comments', async () => {
    mocks.getUserComments.mockResolvedValueOnce({ comments: [{ id: 1 }], total: 1 });
    const res = makeRes();
    await listUserComments({ user, query: {} }, res, vi.fn());
    expect(mocks.getUserComments).toHaveBeenCalledWith('u1', 1, 10);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ total: 1 }) }));
  });
});
