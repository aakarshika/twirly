import createError from 'http-errors';
import { getTrendingSets, getFilteredSets } from './trending.queries.js';

export async function getTrending(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const sets = await getTrendingSets({ limit });
    res.json({ data: sets });
  } catch (err) {
    next(err);
  }
}

export async function getSets(req, res, next) {
  try {
    const userId = req.query.userId || null;
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : null;
    const excludeVoted = req.query.excludeVoted === 'true';
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    if (categoryId && isNaN(categoryId)) {
      throw createError(400, 'categoryId must be a number');
    }

    const sets = await getFilteredSets({ userId, categoryId, excludeVoted, limit });
    res.json({ data: sets });
  } catch (err) {
    next(err);
  }
}
