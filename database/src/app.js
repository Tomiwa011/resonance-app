import cors from 'cors';
import express from 'express';
import { config } from './config/config.js';
import healthRouter from './routes/health.routes.js';
import productsRouter from './routes/products.routes.js';
import ordersRouter from './routes/orders.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';

const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: '10kb' }));

app.use('/api', healthRouter);
app.use('/api', productsRouter);
app.use('/api', ordersRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;