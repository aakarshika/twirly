import { Router } from 'express';
import { getTrending, getSets } from './trending.controller.js';

export const trendingRouter = Router();

trendingRouter.get('/', getTrending);

export const setsRouter = Router();

setsRouter.get('/', getSets);
