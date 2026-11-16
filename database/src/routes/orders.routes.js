import { Router } from 'express';
import { createOrder } from '../controllers/orders.controller.js';
import { orderLimiter } from '../middleware/rate-limit.js';

const router = Router();

router.post('/orders', orderLimiter, createOrder);

export default router;