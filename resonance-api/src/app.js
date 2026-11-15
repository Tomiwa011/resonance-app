import cors from 'cors';
import express from 'express';
import healthRouter from './routes/health.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());
app.use(healthRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
