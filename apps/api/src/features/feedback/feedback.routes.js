import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import { list, get, submit, updateStatus, remove } from './feedback.controller.js';

export const feedbackRouter = Router();

feedbackRouter.get('/', requireAuth, requireAdmin, list);
feedbackRouter.get('/:id', requireAuth, requireAdmin, get);
feedbackRouter.post('/', submit);
feedbackRouter.put('/:id/status', requireAuth, requireAdmin, updateStatus);
feedbackRouter.delete('/:id', requireAuth, requireAdmin, remove);
