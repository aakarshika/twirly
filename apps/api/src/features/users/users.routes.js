import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { optionalAuth } from '../../middleware/optionalAuth.js';
import {
  getUserProfileHandler,
  getUserByUsernameHandler,
  getActivitySummaryHandler,
  updateProfileHandler,
  getNotificationsHandler,
  updateNotificationsHandler,
  getCategoryPrefsHandler,
  updateCategoryPrefsHandler,
  checkUsernameHandler,
  deleteAccountHandler,
} from './users.controller.js';

export const usersRouter = Router();

// Static paths must come before /:id to avoid param capture
usersRouter.get('/check-username',             optionalAuth, checkUsernameHandler);
usersRouter.get('/by-username/:username',                    getUserByUsernameHandler);
usersRouter.get('/me/notifications',            requireAuth, getNotificationsHandler);
usersRouter.put('/me/notifications',            requireAuth, updateNotificationsHandler);
usersRouter.get('/me/category-preferences',     requireAuth, getCategoryPrefsHandler);
usersRouter.put('/me/category-preferences',     requireAuth, updateCategoryPrefsHandler);
usersRouter.put('/me',                          requireAuth, updateProfileHandler);
usersRouter.delete('/me',                       requireAuth, deleteAccountHandler);

// Public reads (optionalAuth so we can extend with private fields later)
usersRouter.get('/:id',                         getUserProfileHandler);
usersRouter.get('/:id/activity-summary',        getActivitySummaryHandler);
