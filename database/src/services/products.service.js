import { query } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

// The database uses snake_case (is_new). The frontend expects camelCase (isNew).
function toProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    brand: row.brand,
    price: row.price,
    isNew: row.is_new,
    rating: Number(row.rating),
    stock: row.stock,
    description: row.description,
    features: row.features,
    specs: row.specs,
    inTheBox: row.in_the_box,
    images: row.images,
  };
}

// Builds the WHERE clause from only the filters that were provided.
// User values always go through $1, $2... params, never into the SQL text.
export async function listProducts({ category, ids } = {}) {
  const conditions = [];
  const params = [];

  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }

  if (ids && ids.length > 0) {
    params.push(ids);
    conditions.push(`id = ANY($${params.length}::int[])`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query(
    `SELECT * FROM products ${where} ORDER BY id`,
    params,
  );

  return result.rows.map(toProduct);
}

export async function getProductBySlug(slug) {
  const result = await query('SELECT * FROM products WHERE slug = $1', [slug]);

  if (result.rows.length === 0) {
    throw new AppError(404, 'Product not found');
  }

  return toProduct(result.rows[0]);
}

// Other products, same category first. Used for "Pairs well with".
export async function getRelatedProducts(slug, limit = 3) {
  const product = await getProductBySlug(slug);

  const result = await query(
    `SELECT * FROM products
     WHERE slug <> $1
     ORDER BY (category = $2) DESC, id
     LIMIT $3`,
    [slug, product.category, limit],
  );

  return result.rows.map(toProduct);
}