import {
  getProductBySlug,
  getRelatedProducts,
  listProducts,
} from '../services/products.service.js';
import { AppError } from '../utils/AppError.js';

const CATEGORIES = ['speakers', 'headphones', 'earphones', 'amplifiers', 'turntables'];

// "1,2,3" -> [1, 2, 3]. Anything else is a 400, so junk never reaches the database.
function parseIds(raw) {
  if (!raw) return undefined;

  const ids = String(raw).split(',').map(Number);

  if (ids.length > 50 || ids.some((id) => !Number.isInteger(id) || id < 1)) {
    throw new AppError(400, 'ids must be a comma-separated list of positive integers');
  }

  return ids;
}

export async function getProducts(req, res) {
  const { category } = req.query;

  if (category !== undefined && !CATEGORIES.includes(category)) {
    throw new AppError(400, `category must be one of: ${CATEGORIES.join(', ')}`);
  }

  const products = await listProducts({ category, ids: parseIds(req.query.ids) });
  res.json(products);
}

export async function getProduct(req, res) {
  const product = await getProductBySlug(req.params.slug);
  res.json(product);
}

export async function getRelated(req, res) {
  const products = await getRelatedProducts(req.params.slug);
  res.json(products);
}