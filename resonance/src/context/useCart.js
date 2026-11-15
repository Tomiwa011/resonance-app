import { useContext, useMemo } from 'react'
import { CartContext } from './context'
import { productsById } from './cartProducts'

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider.')
  }
  return context
}

export function useCartDetails() {
  const { items } = useCart()

  return useMemo(() => {
    const lines = items.flatMap(({ productId, quantity }) => {
      const product = productsById.get(productId)
      return product ? [{ product, quantity, lineTotal: product.price * quantity }] : []
    })

    return {
      lines,
      itemCount: lines.reduce((total, line) => total + line.quantity, 0),
      subtotal: lines.reduce((total, line) => total + line.lineTotal, 0),
    }
  }, [items])
}
