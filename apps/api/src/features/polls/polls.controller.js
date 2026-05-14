import { getUserPolls } from './polls.queries.js';

export async function getPolls(req, res, next) {
  try {
    const polls = await getUserPolls(req.user.id);
    res.json({ data: polls });
  } catch (err) {
    next(err);
  }
}
