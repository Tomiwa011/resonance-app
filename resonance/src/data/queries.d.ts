import type { Product } from '../types/Product'

export function getProductsByCategory(category: string | undefined): Promise<Product[]>
export function getProductBySlug(slug: string): Promise<Product | null>
export function getRelatedProducts(product: Product, limit?: number): Promise<Product[]>
