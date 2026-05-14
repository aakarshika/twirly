import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { log, list, count, weekly, trends } from './activity.controller.js';

export const activityRouter = Router();

activityRouter.post('/',       requireAuth, log);
activityRouter.get('/count',   requireAuth, count);
activityRouter.get('/weekly',  requireAuth, weekly);
activityRouter.get('/trends',  requireAuth, trends);
activityRouter.get('/',        requireAuth, list);
