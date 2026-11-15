import { products } from "./products";

export async function getProductsByCategory(category) {
  return products.filter((product) => product.category === category);
}

export async function getProductBySlug(slug) {
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getRelatedProducts(product, limit = 3) {
  return products
    .filter((item) => item.slug !== product.slug)
    .slice(0, Math.max(0, limit));
}
