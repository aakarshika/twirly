import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireOwner } from '../../middleware/requireOwner.js';
import { optionalAuth } from '../../middleware/optionalAuth.js';
import { getComparisonSetById } from './comparisons.queries.js';
import { listComments, createComment } from '../comments/comments.controller.js';
import {
  getAllSetsHandler,
  getUserSetsHandler,
  getUnpublishedHandler,
  getSetHandler,
  createSet,
  updateSet,
  deleteSet,
  updateItemsHandler,
  updateAspectsHandler,
  likeSetHandler,
  unlikeSetHandler,
} from './comparisons.controller.js';

export const comparisonsRouter = Router();

// Static-path routes must come before /:id to avoid param capture
comparisonsRouter.get('/unpublished',        requireAuth, getUnpublishedHandler);
comparisonsRouter.get('/user/:userId',       getUserSetsHandler);
comparisonsRouter.get('/',                   getAllSetsHandler);
comparisonsRouter.get('/:id',                optionalAuth, getSetHandler);

// Comments (Sprint 8)
comparisonsRouter.get('/:setId/comments',    listComments);
comparisonsRouter.post('/:setId/comments',   requireAuth, createComment);

// Set-level likes
comparisonsRouter.post('/:id/like',          requireAuth, likeSetHandler);
comparisonsRouter.delete('/:id/like',        requireAuth, unlikeSetHandler);

// CRUD
comparisonsRouter.post('/',                  requireAuth, createSet);
comparisonsRouter.put('/:id',                requireAuth, requireOwner(getComparisonSetById), updateSet);
comparisonsRouter.delete('/:id',             requireAuth, requireOwner(getComparisonSetById), deleteSet);

// Sub-resource updates
comparisonsRouter.put('/:id/items',          requireAuth, requireOwner(getComparisonSetById), updateItemsHandler);
comparisonsRouter.put('/:id/aspects',        requireAuth, requireOwner(getComparisonSetById), updateAspectsHandler);
