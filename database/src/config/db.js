import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

export const query = (text, params) => pool.query(text, params);