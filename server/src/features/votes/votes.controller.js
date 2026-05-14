import createError from 'http-errors';
import { castVoteSchema, updateVoteSchema } from './votes.schema.js';
import {
  getUserVotes, getVoteForSet, getVoteCount,
  castVote, updateVote, revertVote, revertVoteBySetId,
} from './votes.queries.js';

export async function listUserVotes(req, res, next) {
  try {
    const votes = await getUserVotes(req.user.id);
    res.json({ data: votes });
  } catch (err) { next(err); }
}

export async function checkVote(req, res, next) {
  try {
    const { setId } = req.query;
    if (!setId) throw createError(400, 'setId required');
    const vote = await getVoteForSet(req.user.id, Number(setId));
    res.json({ data: vote });
  } catch (err) { next(err); }
}

export async function voteCount(req, res, next) {
  try {
    const { setId, itemId } = req.query;
    if (!setId || !itemId) throw createError(400, 'setId and itemId required');
    const count = await getVoteCount(Number(setId), Number(itemId));
    res.json({ data: { count } });
  } catch (err) { next(err); }
}

export async function createVote(req, res, next) {
  try {
    const parsed = castVoteSchema.safeParse(req.body);
    if (!parsed.success) throw createError(400, parsed.error.errors[0].message);
    const { setId, itemId } = parsed.data;

    const existing = await getVoteForSet(req.user.id, setId);
    if (existing) {
      const updated = await updateVote(existing.id, itemId);
      return res.json({ data: updated });
    }

    const vote = await castVote({ userId: req.user.id, setId, itemId });
    res.status(201).json({ data: vote });
  } catch (err) { next(err); }
}

export async function changeVote(req, res, next) {
  try {
    const parsed = updateVoteSchema.safeParse(req.body);
    if (!parsed.success) throw createError(400, parsed.error.errors[0].message);
    const updated = await updateVote(Number(req.params.id), parsed.data.itemId);
    res.json({ data: updated });
  } catch (err) { next(err); }
}

export async function deleteVote(req, res, next) {
  try {
    await revertVote(Number(req.params.id));
    res.status(204).end();
  } catch (err) { next(err); }
}

export async function deleteVoteBySetId(req, res, next) {
  try {
    const setId = req.query.setId ? Number(req.query.setId) : null;
    if (!setId) throw createError(400, 'setId required');
    await revertVoteBySetId(req.user.id, setId);
    res.status(204).end();
  } catch (err) { next(err); }
}
