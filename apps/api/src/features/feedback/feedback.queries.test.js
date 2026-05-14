import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/db.js', () => ({
  db: { execute: vi.fn() },
}));

const { db } = await import('../../config/db.js');
const { listFeedback, getFeedback, submitFeedback, updateFeedbackStatus, deleteFeedback } = await import('./feedback.queries.js');

beforeEach(() => db.execute.mockReset());

describe('listFeedback', () => {
  it('returns all feedback rows', async () => {
    const rows = [{ id: 1, status: 'pending' }];
    db.execute.mockResolvedValueOnce({ rows });
    expect(await listFeedback()).toEqual(rows);
  });

  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db fail'));
    await expect(listFeedback()).rejects.toThrow('db fail');
  });
});

describe('getFeedback', () => {
  it('returns single row', async () => {
    const row = { id: 1 };
    db.execute.mockResolvedValueOnce({ rows: [row] });
    expect(await getFeedback(1)).toEqual(row);
  });

  it('returns null when not found', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await getFeedback(999)).toBeNull();
  });

  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db fail'));
    await expect(getFeedback(1)).rejects.toThrow('db fail');
  });
});

describe('submitFeedback', () => {
  it('inserts and returns new row', async () => {
    const row = { id: 2, message: 'bug found' };
    db.execute.mockResolvedValueOnce({ rows: [row] });
    expect(await submitFeedback({ message: 'bug found' })).toEqual(row);
  });

  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db fail'));
    await expect(submitFeedback({ message: 'test' })).rejects.toThrow('db fail');
  });
});

describe('updateFeedbackStatus', () => {
  it('returns updated row', async () => {
    const row = { id: 1, status: 'resolved' };
    db.execute.mockResolvedValueOnce({ rows: [row] });
    expect(await updateFeedbackStatus(1, 'resolved')).toEqual(row);
  });

  it('returns null when not found', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    expect(await updateFeedbackStatus(999, 'resolved')).toBeNull();
  });

  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db fail'));
    await expect(updateFeedbackStatus(1, 'resolved')).rejects.toThrow('db fail');
  });
});

describe('deleteFeedback', () => {
  it('executes delete without error', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });
    await expect(deleteFeedback(1)).resolves.toBeUndefined();
  });

  it('propagates db errors', async () => {
    db.execute.mockRejectedValueOnce(new Error('db fail'));
    await expect(deleteFeedback(1)).rejects.toThrow('db fail');
  });
});
