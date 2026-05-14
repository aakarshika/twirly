import { Router } from 'express';
import { getKarma } from './karma.controller.js';

export const karmaRouter = Router();

karmaRouter.get('/', getKarma);
