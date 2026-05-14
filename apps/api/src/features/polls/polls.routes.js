import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { getPolls } from './polls.controller.js';

export const pollsRouter = Router();

pollsRouter.get('/', requireAuth, getPolls);
