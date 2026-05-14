import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { optionalAuth } from '../../middleware/optionalAuth.js';
import {
  getItemHandler, getItemMetricsHandler, getItemSetsHandler,
  listItemReviewsHandler, createItemReviewHandler, getItemCommentsHandler,
} from './items.controller.js';

export const itemsRouter = Router();

itemsRouter.get('/:id',           getItemHandler);
itemsRouter.get('/:id/metrics',   getItemMetricsHandler);
itemsRouter.get('/:id/sets',      getItemSetsHandler);
itemsRouter.get('/:id/comments',  getItemCommentsHandler);
itemsRouter.get('/:id/reviews',   optionalAuth, listItemReviewsHandler);
itemsRouter.post('/:id/reviews',  requireAuth,  createItemReviewHandler);
