import { apiGet } from '../api/client.js'

// Same function names as before, so the pages don't change.
// Failures are logged and turned into "no data" so a page never hangs on "Loading...".

export async function getProductsByCategory(category) {
  try {
    const products = await apiGet(`/products?category=${encodeURIComponent(category)}`)
    return products ?? []
  } catch (error) {
    console.error('Could not load products', error)
    return []
  }
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