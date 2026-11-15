import { config } from './config/config.js';
import app from './app.js';

app.listen(config.port, () => {
  console.log(`API running at http://localhost:${config.port}`);
});