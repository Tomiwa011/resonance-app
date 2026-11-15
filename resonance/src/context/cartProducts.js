import { products } from '../data/products'

export const productsById = new Map(products.map((product) => [product.id, product]))
