import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./feedback.queries.js', () => ({
  listFeedback: vi.fn(),
  getFeedback: vi.fn(),
  submitFeedback: vi.fn(),
  updateFeedbackStatus: vi.fn(),
  deleteFeedback: vi.fn(),
}));

const mocks = await import('./feedback.queries.js');
const { list, get, submit, updateStatus, remove } = await import('./feedback.controller.js');

function makeRes() {
  const res = { json: vi.fn().mockReturnThis(), status: vi.fn().mockReturnThis(), end: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

beforeEach(() => Object.values(mocks).forEach((m) => m.mockReset?.()));

describe('list', () => {
  it('returns all feedback', async () => {
    mocks.listFeedback.mockResolvedValueOnce([{ id: 1 }]);
    const res = makeRes();
    await list({}, res, vi.fn());
    expect(res.json).toHaveBeenCalledWith({ data: [{ id: 1 }] });
  });

  it('forwards db errors', async () => {
    mocks.listFeedback.mockRejectedValueOnce(new Error('db fail'));
    const next = vi.fn();
    await list({}, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db fail' }));
  });
});

describe('get', () => {
  it('returns feedback by id', async () => {
    mocks.getFeedback.mockResolvedValueOnce({ id: 1 });
    const res = makeRes();
    await get({ params: { id: '1' } }, res, vi.fn());
    expect(res.json).toHaveBeenCalledWith({ data: { id: 1 } });
  });

  it('returns 404 when not found', async () => {
    mocks.getFeedback.mockResolvedValueOnce(null);
    const next = vi.fn();
    await get({ params: { id: '999' } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
  });

  it('returns 400 for invalid id', async () => {
    const next = vi.fn();
    await get({ params: { id: 'bad' } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });
});

describe('submit', () => {
  it('creates feedback and returns 201', async () => {
    const row = { id: 3, message: 'help' };
    mocks.submitFeedback.mockResolvedValueOnce(row);
    const res = makeRes();
    await submit({ body: { message: 'help' } }, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: row });
  });

  it('returns 400 when message missing', async () => {
    const next = vi.fn();
    await submit({ body: {} }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it('forwards db errors', async () => {
    mocks.submitFeedback.mockRejectedValueOnce(new Error('db fail'));
    const next = vi.fn();
    await submit({ body: { message: 'test' } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'db fail' }));
  });
});

describe('updateStatus', () => {
  it('updates status and returns row', async () => {
    mocks.updateFeedbackStatus.mockResolvedValueOnce({ id: 1, status: 'resolved' });
    const res = makeRes();
    await updateStatus({ params: { id: '1' }, body: { status: 'resolved' } }, res, vi.fn());
    expect(res.json).toHaveBeenCalledWith({ data: { id: 1, status: 'resolved' } });
  });

  it('returns 400 for invalid status', async () => {
    const next = vi.fn();
    await updateStatus({ params: { id: '1' }, body: { status: 'invalid' } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it('returns 404 when not found', async () => {
    mocks.updateFeedbackStatus.mockResolvedValueOnce(null);
    const next = vi.fn();
    await updateStatus({ params: { id: '999' }, body: { status: 'resolved' } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
  });
});

describe('remove', () => {
  it('deletes and returns 204', async () => {
    mocks.getFeedback.mockResolvedValueOnce({ id: 1 });
    mocks.deleteFeedback.mockResolvedValueOnce(undefined);
    const res = makeRes();
    await remove({ params: { id: '1' } }, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  it('returns 404 when not found', async () => {
    mocks.getFeedback.mockResolvedValueOnce(null);
    const next = vi.fn();
    await remove({ params: { id: '999' } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
  });
});
