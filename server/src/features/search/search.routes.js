import { Router } from 'express';
import { search } from './search.controller.js';

export const searchRouter = Router();

searchRouter.get('/', search);
