import createError from 'http-errors';
import { z } from 'zod';
import {
  getComparisonSetById,
  getFullComparison,
  getAllComparisons,
  getUserComparisons,
  getUnpublishedComparison,
  createComparison,
  updateComparison,
  updateItems,
  updateAspects,
  deleteComparisonSet,
  likeSet,
  unlikeSet,
} from './comparisons.queries.js';

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const aspectSchema = z.object({
  id:          z.number().int().positive().optional(),
  metricName:  z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  weight:      z.number().int().min(1).max(10).default(1),
});

const createSchema = z.object({
  name:        z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  categoryId:  z.number().int().positive().optional(),
  endDate:     z.string().datetime().optional(),
  isPublished: z.boolean().default(true),
  itemIds:     z.array(z.number().int().positive()).max(10).default([]),
  aspects:     z.array(aspectSchema).max(20).default([]),
});

const updateSchema = z.object({
  name:        z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  categoryId:  z.number().int().positive().optional(),
  endDate:     z.string().datetime().optional(),
  isPublished: z.boolean().optional(),
  itemIds:     z.array(z.number().int().positive()).max(10).optional(),
  aspects:     z.array(aspectSchema).max(20).optional(),
});

const itemsSchema = z.object({
  itemIds: z.array(z.number().int().positive()).min(1).max(10),
});

const aspectsSchema = z.object({
  aspects: z.array(aspectSchema).max(20),
});

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function getAllSetsHandler(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const sets = await getAllComparisons(limit);
    res.json({ data: sets });
  } catch (err) { next(err); }
}

export async function getUserSetsHandler(req, res, next) {
  try {
    const sets = await getUserComparisons(req.params.userId);
    res.json({ data: sets });
  } catch (err) { next(err); }
}

export async function getUnpublishedHandler(req, res, next) {
  try {
    const set = await getUnpublishedComparison(req.user.id);
    if (!set) throw createError(404, 'No unpublished comparison found');
    res.json({ data: set });
  } catch (err) { next(err); }
}

export async function getSetHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) throw createError(400, 'Invalid id');
    const set = await getFullComparison(id);
    if (!set) throw createError(404, 'Comparison not found');
    res.json({ data: set });
  } catch (err) { next(err); }
}

export async function createSet(req, res, next) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw createError(400, parsed.error.flatten());
    const set = await createComparison({ userId: req.user.id, ...parsed.data });
    res.status(201).json({ data: set });
  } catch (err) { next(err); }
}

export async function updateSet(req, res, next) {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) throw createError(400, parsed.error.flatten());
    const id = parseInt(req.params.id, 10);
    const updated = await updateComparison(id, parsed.data);
    if (!updated) throw createError(404, 'Comparison not found');
    res.json({ data: updated });
  } catch (err) { next(err); }
}

export async function deleteSet(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await deleteComparisonSet(id);
    if (!deleted) throw createError(404, 'Comparison not found');
    res.status(204).end();
  } catch (err) { next(err); }
}

export async function updateItemsHandler(req, res, next) {
  try {
    const parsed = itemsSchema.safeParse(req.body);
    if (!parsed.success) throw createError(400, parsed.error.flatten());
    const setId = parseInt(req.params.id, 10);
    const result = await updateItems(setId, parsed.data.itemIds);
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function updateAspectsHandler(req, res, next) {
  try {
    const parsed = aspectsSchema.safeParse(req.body);
    if (!parsed.success) throw createError(400, parsed.error.flatten());
    const setId = parseInt(req.params.id, 10);
    const result = await updateAspects(setId, parsed.data.aspects);
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function likeSetHandler(req, res, next) {
  try {
    const setId = parseInt(req.params.id, 10);
    if (!Number.isFinite(setId)) throw createError(400, 'Invalid id');
    const result = await likeSet(setId, req.user.id);
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function unlikeSetHandler(req, res, next) {
  try {
    const setId = parseInt(req.params.id, 10);
    if (!Number.isFinite(setId)) throw createError(400, 'Invalid id');
    const result = await unlikeSet(setId, req.user.id);
    res.json({ data: result });
  } catch (err) { next(err); }
}
