export type ProductCategory =
  | 'speakers'
  | 'headphones'
  | 'earphones'
  | 'amplifiers'
  | 'turntables'

export interface Product {
  slug: string
  name: string
  category: ProductCategory
  price: number
  images: string[]
  isNew: boolean
  rating: number
}
