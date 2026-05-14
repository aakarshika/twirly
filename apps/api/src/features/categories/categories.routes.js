import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { listCategoriesHandler, createCategoryHandler, getPopularCategoriesHandler } from './categories.controller.js';

export const categoriesRouter = Router();

categoriesRouter.get('/popular', getPopularCategoriesHandler);
categoriesRouter.get('/',        listCategoriesHandler);
categoriesRouter.post('/',       requireAuth, createCategoryHandler);
