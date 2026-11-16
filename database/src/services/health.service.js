import { query } from '../config/db.js';

export function getHealth() {
  return query('SELECT 1').then(() => ({
    status: 'ok',
    database: 'connected',
  }));
}
