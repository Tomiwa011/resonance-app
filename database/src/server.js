import { config } from './config/config.js';
import app from './app.js';
import { pool, query } from './config/db.js';

async function startServer() {
  try {
    await query('SELECT 1');
  } catch (error) {
    console.error('Unable to connect to the database; the API was not started.', error);
    await pool.end();
    process.exitCode = 1;
    return;
  }

  app.listen(config.port, () => {
    console.log(`API running at http://localhost:${config.port}`);
  });
}

startServer();