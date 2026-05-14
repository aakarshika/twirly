import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import {
  likeReviewHandler, unlikeReviewHandler, listUserReviews,
} from './reviews.controller.js';

export const reviewsRouter = Router();

// Review-level operations
reviewsRouter.post('/:id/like', requireAuth, likeReviewHandler);
reviewsRouter.delete('/:id/like', requireAuth, unlikeReviewHandler);

// User's review history — deferred to Sprint 10 for full user profile; stub included here
reviewsRouter.get('/user/:userId', listUserReviews);
