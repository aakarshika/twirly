import createError from 'http-errors';
import { listFeedback, getFeedback, submitFeedback, updateFeedbackStatus, deleteFeedback } from './feedback.queries.js';

const VALID_STATUSES = new Set(['pending', 'in_progress', 'resolved', 'wont_fix']);

export async function list(req, res, next) {
  try {
    const rows = await listFeedback();
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) throw createError(400, 'Invalid id');
    const row = await getFeedback(id);
    if (!row) throw createError(404, 'Feedback not found');
    res.json({ data: row });
  } catch (err) {
    next(err);
  }
}

export async function submit(req, res, next) {
  try {
    const { name, type, priority, message, imageUrl, pageRoute } = req.body;
    if (!message?.trim()) throw createError(400, 'message is required');
    const row = await submitFeedback({ name, type, priority, message, imageUrl, pageRoute });
    res.status(201).json({ data: row });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) throw createError(400, 'Invalid id');
    const { status } = req.body;
    if (!VALID_STATUSES.has(status)) throw createError(400, `status must be one of: ${[...VALID_STATUSES].join(', ')}`);
    const row = await updateFeedbackStatus(id, status);
    if (!row) throw createError(404, 'Feedback not found');
    res.json({ data: row });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) throw createError(400, 'Invalid id');
    const existing = await getFeedback(id);
    if (!existing) throw createError(404, 'Feedback not found');
    await deleteFeedback(id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
