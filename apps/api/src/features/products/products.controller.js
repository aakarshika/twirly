import createError from 'http-errors';
import { createProductSchema, updateProductSchema } from './products.schema.js';
import {
  getProduct, getUserProducts, searchProducts,
  createProduct, updateProduct, deleteProduct,
} from './products.queries.js';

export async function getProductHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) throw createError(400, 'Invalid id');

    const product = await getProduct(id);
    if (!product) throw createError(404, 'Product not found');
    res.json({ data: product });
  } catch (err) { next(err); }
}

export async function listUserProductsHandler(req, res, next) {
  try {
    const products = await getUserProducts(req.params.userId);
    res.json({ data: products });
  } catch (err) { next(err); }
}

export async function searchProductsHandler(req, res, next) {
  try {
    const q = (req.query.q ?? '').trim();
    if (!q) return res.json({ data: [] });

    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const products = await searchProducts(q, limit);
    res.json({ data: products });
  } catch (err) { next(err); }
}

export async function createProductHandler(req, res, next) {
  try {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) throw createError(400, parsed.error.flatten());

    const product = await createProduct(req.user.id, parsed.data);
    res.status(201).json({ data: product });
  } catch (err) { next(err); }
}

export async function updateProductHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) throw createError(400, 'Invalid id');

    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) throw createError(400, parsed.error.flatten());

    const product = await updateProduct(id, parsed.data);
    if (!product) throw createError(404, 'Product not found');
    res.json({ data: product });
  } catch (err) { next(err); }
}

export async function deleteProductHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) throw createError(400, 'Invalid id');

    const deleted = await deleteProduct(id);
    if (!deleted) throw createError(404, 'Product not found');
    res.status(204).end();
  } catch (err) { next(err); }
}
