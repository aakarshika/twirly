import createError from 'http-errors';
import { z } from 'zod';
import { searchCategories, createCategory, getPopularCategories } from './categories.queries.js';

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export async function listCategoriesHandler(req, res, next) {
  try {
    const q     = (req.query.q ?? '').trim();
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const categories = await searchCategories(q, limit);
    res.json({ data: categories });
  } catch (err) { next(err); }
}

export async function createCategoryHandler(req, res, next) {
  try {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) throw createError(400, parsed.error.flatten());

    const category = await createCategory(parsed.data.name);
    res.status(201).json({ data: category });
  } catch (err) { next(err); }
}

export async function getPopularCategoriesHandler(req, res, next) {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const categories = await getPopularCategories(limit);
    res.json({ data: categories });
  } catch (err) { next(err); }
}
