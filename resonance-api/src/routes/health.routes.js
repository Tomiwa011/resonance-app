import { Router } from 'express';
import { healthController } from '../controllers/health.controller.js';

const healthRouter = Router();

healthRouter.get('/api/health', healthController);

export default healthRouter;
