import { Router } from 'express';
import { getTrending, getSets, getSet } from './trending.controller.js';

export const trendingRouter = Router();

trendingRouter.get('/', getTrending);

export const setsRouter = Router();

setsRouter.get('/:id', getSet);
setsRouter.get('/', getSets);
