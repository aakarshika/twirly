import createError from 'http-errors';
import { getUserKarma, getMultipleUsersKarma } from './karma.queries.js';

export async function getKarma(req, res, next) {
  try {
    const { userId } = req.query;
    const userIds = req.query['userIds[]'];

    if (userIds !== undefined) {
      const ids = Array.isArray(userIds) ? userIds : [userIds];
      if (!ids.length) throw createError(400, 'userIds[] must not be empty');
      const rows = await getMultipleUsersKarma(ids);
      return res.json({ data: rows });
    }

    if (!userId) throw createError(400, 'userId or userIds[] required');
    const row = await getUserKarma(userId);
    res.json({ data: row });
  } catch (err) {
    next(err);
  }
}
