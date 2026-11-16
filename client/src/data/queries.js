import { apiGet } from '../api/client.js'

export async function getProductsByCategory(category) {
  const path = category
    ? `/products?category=${encodeURIComponent(category)}`
    : '/products'
  const products = await apiGet(path)
  return products ?? []
}

export async function getProductBySlug(slug) {
  try {
    return await apiGet(`/products/${encodeURIComponent(slug)}`)
  } catch (error) {
    console.error('Could not load product', error)
    return null
  }
}

export async function getRelatedProducts(product) {
  try {
    const products = await apiGet(`/products/${encodeURIComponent(product.slug)}/related`)
    return products ?? []
  } catch (error) {
    console.error('Could not load related products', error)
    return []
  }
}

export async function getProductsByIds(ids) {
  if (ids.length === 0) return []

  try {
    const products = await apiGet(`/products?ids=${ids.join(',')}`)
    return products ?? []
  } catch (error) {
    console.error('Could not load cart products', error)
    return []
  }
}