import { Router } from 'express';
import {
  getProduct,
  getProducts,
  getRelated,
} from '../controllers/products.controller.js';

const router = Router();

router.get('/products', getProducts);
router.get('/products/:slug', getProduct);
router.get('/products/:slug/related', getRelated);

export default router;