import { pool } from '../src/config/db.js';
import { products } from './products.js';

const insertSql = `
  INSERT INTO products
    (slug, name, category, brand, price, is_new, rating, stock,
     description, features, specs, in_the_box, images)
  VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  ON CONFLICT (slug) DO NOTHING
`;

async function seed() {
  try {
    for (const p of products) {
      await pool.query(insertSql, [
        p.slug,
        p.name,
        p.category,
        p.brand,
        p.price,
        p.isNew,
        p.rating,
        p.stock,
        p.description,
        JSON.stringify(p.features),
        JSON.stringify(p.specs),
        JSON.stringify(p.inTheBox),
        JSON.stringify(p.images),
      ]);
    }
    console.log(`Seeded ${products.length} products.`);
  } finally {
    await pool.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});