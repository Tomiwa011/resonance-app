import { getHealth } from '../services/health.service.js';

export async function healthController(_req, res) {
  try {
    res.status(200).json(await getHealth());
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
}
