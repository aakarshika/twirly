import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireOwner } from '../../middleware/requireOwner.js';
import { getProductById } from './products.queries.js';
import {
  getProductHandler, listUserProductsHandler, searchProductsHandler,
  createProductHandler, updateProductHandler, deleteProductHandler,
} from './products.controller.js';

export const productsRouter = Router();

productsRouter.get('/search',      searchProductsHandler);
productsRouter.get('/user/:userId', listUserProductsHandler);
productsRouter.get('/:id',         getProductHandler);
productsRouter.post('/',           requireAuth, createProductHandler);
productsRouter.put('/:id',         requireAuth, requireOwner(getProductById), updateProductHandler);
productsRouter.delete('/:id',      requireAuth, requireOwner(getProductById), deleteProductHandler);
