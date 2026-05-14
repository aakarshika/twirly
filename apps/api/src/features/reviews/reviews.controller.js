import createError from 'http-errors';
import { postReviewSchema } from './reviews.schema.js';
import {
  getReviews, getUserReviews,
  postReview, likeReview, unlikeReview,
} from './reviews.queries.js';

export async function listItemReviews(req, res, next) {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    if (!Number.isFinite(itemId)) throw createError(400, 'Invalid itemId');

    const page     = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));

    const { reviews, total } = await getReviews(itemId, page, pageSize, req.user?.id ?? null);
    res.json({ data: { reviews, total, page, pageSize, hasMore: total > page * pageSize } });
  } catch (err) { next(err); }
}

export async function createReview(req, res, next) {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    if (!Number.isFinite(itemId)) throw createError(400, 'Invalid itemId');

    const parsed = postReviewSchema.safeParse(req.body);
    if (!parsed.success) throw createError(400, parsed.error.flatten());

    const review = await postReview(itemId, req.user.id, parsed.data.text);
    res.status(201).json({ data: review });
  } catch (err) { next(err); }
}

export async function listUserReviews(req, res, next) {
  try {
    const { userId } = req.params;
    const page     = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 20));

    const { reviews, total } = await getUserReviews(userId, page, pageSize);
    res.json({ data: { reviews, total, page, pageSize, hasMore: total > page * pageSize } });
  } catch (err) { next(err); }
}

export async function likeReviewHandler(req, res, next) {
  try {
    const reviewId = parseInt(req.params.id, 10);
    if (!Number.isFinite(reviewId)) throw createError(400, 'Invalid reviewId');

    const review = await likeReview(reviewId, req.user.id);
    res.json({ data: review ?? { alreadyLiked: true } });
  } catch (err) { next(err); }
}

export async function unlikeReviewHandler(req, res, next) {
  try {
    const reviewId = parseInt(req.params.id, 10);
    if (!Number.isFinite(reviewId)) throw createError(400, 'Invalid reviewId');

    const review = await unlikeReview(reviewId, req.user.id);
    res.json({ data: review ?? { notLiked: true } });
  } catch (err) { next(err); }
}
