import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { listComments, createComment } from '../comments/comments.controller.js';

// Stub router — Sprint 9 will add full CRUD routes for comparison sets.
export const comparisonsRouter = Router();

comparisonsRouter.get('/:setId/comments', listComments);
comparisonsRouter.post('/:setId/comments', requireAuth, createComment);
