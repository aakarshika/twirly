import createError from 'http-errors';
import { searchSets, searchItems, searchUsers } from './search.queries.js';

const VALID_TYPES = new Set(['sets', 'items', 'users', 'all']);

export async function search(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    const type = req.query.type || 'all';
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    if (!q) throw createError(400, 'q is required');
    if (!VALID_TYPES.has(type)) throw createError(400, 'type must be sets, items, users, or all');

    if (type === 'sets') return res.json({ data: await searchSets(q, limit) });
    if (type === 'items') return res.json({ data: await searchItems(q, limit) });
    if (type === 'users') return res.json({ data: await searchUsers(q, limit) });

    const [sets, items, users] = await Promise.all([
      searchSets(q, limit),
      searchItems(q, limit),
      searchUsers(q, limit),
    ]);
    res.json({ data: { sets, items, users } });
  } catch (err) {
    next(err);
  }
}
