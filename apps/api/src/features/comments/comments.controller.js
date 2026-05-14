import createError from 'http-errors';
import { postCommentSchema } from './comments.schema.js';
import {
  getComments, getUserComments,
  postComment, postReply,
  addReaction, removeReaction,
} from './comments.queries.js';

export async function listComments(req, res, next) {
  try {
    const setId = parseInt(req.params.setId, 10);
    if (!Number.isFinite(setId)) throw createError(400, 'Invalid setId');

    const page     = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));

    const { comments, total } = await getComments(setId, page, pageSize);
    res.json({ data: { comments, total, page, pageSize, hasMore: total > page * pageSize } });
  } catch (err) { next(err); }
}

export async function createComment(req, res, next) {
  try {
    const setId = parseInt(req.params.setId, 10);
    if (!Number.isFinite(setId)) throw createError(400, 'Invalid setId');

    const parsed = postCommentSchema.safeParse(req.body);
    if (!parsed.success) throw createError(400, parsed.error.flatten());

    const comment = await postComment(setId, req.user.id, parsed.data.content);
    res.status(201).json({ data: comment });
  } catch (err) { next(err); }
}

export async function createReply(req, res, next) {
  try {
    const commentId = parseInt(req.params.id, 10);
    if (!Number.isFinite(commentId)) throw createError(400, 'Invalid commentId');

    const parsed = postCommentSchema.safeParse(req.body);
    if (!parsed.success) throw createError(400, parsed.error.flatten());

    const reply = await postReply(commentId, req.user.id, parsed.data.content);
    if (!reply) throw createError(404, 'Comment not found');
    res.status(201).json({ data: reply });
  } catch (err) { next(err); }
}

export async function addReactionHandler(req, res, next) {
  try {
    const commentId = parseInt(req.params.id, 10);
    if (!Number.isFinite(commentId)) throw createError(400, 'Invalid commentId');

    const reactionType = req.body.reactionType ?? 'like';
    await addReaction(commentId, req.user.id, reactionType);
    res.json({ data: { added: true } });
  } catch (err) { next(err); }
}

export async function removeReactionHandler(req, res, next) {
  try {
    const commentId = parseInt(req.params.id, 10);
    if (!Number.isFinite(commentId)) throw createError(400, 'Invalid commentId');

    await removeReaction(commentId, req.user.id);
    res.json({ data: { removed: true } });
  } catch (err) { next(err); }
}

export async function listUserComments(req, res, next) {
  try {
    const page     = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));

    const { comments, total } = await getUserComments(req.user.id, page, pageSize);
    res.json({ data: { comments, total, page, pageSize, hasMore: total > page * pageSize } });
  } catch (err) { next(err); }
}
