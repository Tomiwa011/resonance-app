import { rateLimit } from 'express-rate-limit';

const tooManyRequests = (message) => (req, res) => {
  res.status(429).json({ error: message });
};

// Everything under /api: generous, just stops runaway scripts.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests('Too many requests. Please try again in a few minutes.'),
});

// Placing orders: strict, since each one writes to the database.
export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests('Too many order attempts. Please try again in a few minutes.'),
});