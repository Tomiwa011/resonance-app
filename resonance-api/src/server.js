import 'dotenv/config';
import app from './app.js';

app.listen(process.env.PORT, () => {
  console.log(`Resonance API listening on port ${process.env.PORT}`);
});
