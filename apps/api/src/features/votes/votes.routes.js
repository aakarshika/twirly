import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireOwner } from '../../middleware/requireOwner.js';
import { getVoteById } from './votes.queries.js';
import {
  listUserVotes, checkVote, voteCount,
  createVote, changeVote, deleteVote, deleteVoteBySetId,
} from './votes.controller.js';

export const votesRouter = Router();

// Read routes — /check and /count must come before /:id to avoid route collision
votesRouter.get('/check', requireAuth, checkVote);
votesRouter.get('/count', voteCount);
votesRouter.get('/', requireAuth, listUserVotes);

// Write routes
votesRouter.post('/', requireAuth, createVote);
votesRouter.put('/:id', requireAuth, requireOwner(getVoteById), changeVote);
votesRouter.delete('/:id', requireAuth, requireOwner(getVoteById), deleteVote);

// Delete by setId (no vote id needed — uses auth session user)
votesRouter.delete('/', requireAuth, deleteVoteBySetId);
