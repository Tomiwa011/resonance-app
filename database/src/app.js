import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import { config } from './config/config.js';
import healthRouter from './routes/health.routes.js';
import productsRouter from './routes/products.routes.js';
import ordersRouter from './routes/orders.routes.js';
import { apiLimiter } from './middleware/rate-limit.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../client/dist');

const app = express();

app.disable('x-powered-by');

// On Render, requests pass through one proxy. Without this, every visitor
// looks like the same IP address and would share one rate limit.
app.set('trust proxy', 1);

const clientOrigins = new Set(config.clientOrigin ? [config.clientOrigin] : []);
if (config.clientOrigin) {
  const configuredOrigin = new URL(config.clientOrigin);
  if (configuredOrigin.hostname === 'localhost') {
    configuredOrigin.hostname = '127.0.0.1';
    clientOrigins.add(configuredOrigin.origin);
  } else if (configuredOrigin.hostname === '127.0.0.1') {
    configuredOrigin.hostname = 'localhost';
    clientOrigins.add(configuredOrigin.origin);
  }
}

if (clientOrigins.size) {
  app.use(cors({ origin: [...clientOrigins] }));
}

app.use(express.json({ limit: '10kb' }));

app.use('/api', apiLimiter);
app.use('/api', healthRouter);
app.use('/api', productsRouter);
app.use('/api', ordersRouter);

// Serve the built React app (only when it has been built).
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;