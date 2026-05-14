import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { createReply, addReactionHandler, removeReactionHandler, listUserComments } from './comments.controller.js';

export const commentsRouter = Router();

// /api/comments/:id/replies
commentsRouter.post('/:id/replies', requireAuth, createReply);

// /api/comments/:id/react
commentsRouter.post('/:id/react', requireAuth, addReactionHandler);
commentsRouter.delete('/:id/react', requireAuth, removeReactionHandler);

// /api/comments/mine  (user's own comments — full Sprint 10 user route is carry-over)
commentsRouter.get('/mine', requireAuth, listUserComments);
