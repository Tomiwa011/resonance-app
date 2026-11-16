import { readFile } from 'node:fs/promises';
import { pool } from '../src/config/db.js';

async function setup() {
  try {
    const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
    await pool.query(schema);
    console.log('Database schema is ready.');
  } finally {
    await pool.end();
  }
}

setup().catch((error) => {
  console.error('Unable to set up the database schema.', error);
  process.exitCode = 1;
});
