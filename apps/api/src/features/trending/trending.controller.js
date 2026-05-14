import createError from 'http-errors';
import {
  getTrendingSets, getFilteredSets, getSetById,
  getSetAspects, getAspect, getRemainingAspects, getSimilarSets,
  addAspectReaction, removeAspectReaction,
} from './trending.queries.js';

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

export async function getSet(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) throw createError(400, 'id must be a number');
    const userId = req.query.userId || null;
    const set = await getSetById(id, userId);
    if (!set) throw createError(404, 'Set not found');
    res.json({ data: set });
  } catch (err) {
    next(err);
  }
}

export async function getSetAspectsHandler(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) throw createError(400, 'id must be a number');
    const userId = req.user?.id ?? null;
    const aspects = await getSetAspects(id, userId);
    res.json({ data: aspects });
  } catch (err) { next(err); }
}

export async function getAspectHandler(req, res, next) {
  try {
    const id = Number(req.params.aspectId);
    if (isNaN(id)) throw createError(400, 'aspectId must be a number');
    const userId = req.user?.id ?? null;
    const aspect = await getAspect(id, userId);
    if (!aspect) throw createError(404, 'Aspect not found');
    res.json({ data: aspect });
  } catch (err) { next(err); }
}

export async function getRemainingAspectsHandler(req, res, next) {
  try {
    const id = Number(req.params.aspectId);
    if (isNaN(id)) throw createError(400, 'aspectId must be a number');
    if (!req.user) throw createError(401, 'Authentication required');
    const aspects = await getRemainingAspects(id, req.user.id);
    res.json({ data: aspects });
  } catch (err) { next(err); }
}

export async function getSimilarSetsHandler(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) throw createError(400, 'id must be a number');
    const limit  = Math.min(Number(req.query.limit) || 5, 20);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const sets = await getSimilarSets(id, limit, offset);
    res.json({ data: sets });
  } catch (err) { next(err); }
}

export async function addAspectReactionHandler(req, res, next) {
  try {
    const id = Number(req.params.aspectId);
    if (isNaN(id)) throw createError(400, 'aspectId must be a number');
    const reactionType = req.body?.reactionType ?? 'like';
    await addAspectReaction(id, req.user.id, reactionType);
    res.status(204).end();
  } catch (err) { next(err); }
}

export async function removeAspectReactionHandler(req, res, next) {
  try {
    const id = Number(req.params.aspectId);
    if (isNaN(id)) throw createError(400, 'aspectId must be a number');
    await removeAspectReaction(id, req.user.id);
    res.status(204).end();
  } catch (err) { next(err); }
}
