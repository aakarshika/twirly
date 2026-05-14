import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { optionalAuth } from '../../middleware/optionalAuth.js';
import {
  getTrending, getSets, getSet,
  getSetAspectsHandler, getAspectHandler, getRemainingAspectsHandler,
  getSimilarSetsHandler, addAspectReactionHandler, removeAspectReactionHandler,
} from './trending.controller.js';

export const trendingRouter = Router();

trendingRouter.get('/', getTrending);

export const setsRouter = Router();

// Static aspect sub-paths before /:id
setsRouter.get('/aspects/:aspectId',           optionalAuth, getAspectHandler);
setsRouter.get('/aspects/:aspectId/remaining', requireAuth,  getRemainingAspectsHandler);
setsRouter.post('/aspects/:aspectId/reactions',  requireAuth,  addAspectReactionHandler);
setsRouter.delete('/aspects/:aspectId/reactions', requireAuth, removeAspectReactionHandler);

setsRouter.get('/:id',          optionalAuth, getSet);
setsRouter.get('/:id/aspects',  optionalAuth, getSetAspectsHandler);
setsRouter.get('/:id/similar',              getSimilarSetsHandler);
setsRouter.get('/',                         getSets);
