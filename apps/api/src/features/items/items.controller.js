import createError from 'http-errors';
import { getItem, getItemMetrics, getItemSets, getItemComments } from './items.queries.js';
import { getReviews, postReview } from '../reviews/reviews.queries.js';
import { postReviewSchema } from '../reviews/reviews.schema.js';

export async function getItemHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) throw createError(400, 'Invalid id');

    const item = await getItem(id);
    if (!item) throw createError(404, 'Item not found');
    res.json({ data: item });
  } catch (err) { next(err); }
}

export async function getItemMetricsHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) throw createError(400, 'Invalid id');

    const metrics = await getItemMetrics(id);
    res.json({ data: metrics });
  } catch (err) { next(err); }
}

export async function getItemSetsHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) throw createError(400, 'Invalid id');

    const sets = await getItemSets(id);
    res.json({ data: sets });
  } catch (err) { next(err); }
}

export async function listItemReviewsHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) throw createError(400, 'Invalid id');

    const page     = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));

    const { reviews, total } = await getReviews(id, page, pageSize, req.user?.id ?? null);
    res.json({ data: { reviews, total, page, pageSize, hasMore: total > page * pageSize } });
  } catch (err) { next(err); }
}

export async function createItemReviewHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) throw createError(400, 'Invalid id');

    const parsed = postReviewSchema.safeParse(req.body);
    if (!parsed.success) throw createError(400, parsed.error.flatten());

    const review = await postReview(id, req.user.id, parsed.data.text);
    res.status(201).json({ data: review });
  } catch (err) { next(err); }
}

export async function getItemCommentsHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) throw createError(400, 'Invalid id');

    const page     = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));

    const { comments, total } = await getItemComments(id, page, pageSize);
    res.json({ data: { comments, total, page, pageSize, hasMore: total > page * pageSize } });
  } catch (err) { next(err); }
}
