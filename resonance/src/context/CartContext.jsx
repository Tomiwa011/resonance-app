import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { CartContext } from './context'
import { productsById } from './cartProducts'

const CART_STORAGE_KEY = 'resonance-cart'

function cartReducer(items, action) {
  switch (action.type) {
    case 'ADD': {
      const product = productsById.get(action.productId)
      const quantity = Math.floor(action.quantity)

      if (!product || !Number.isFinite(quantity) || quantity <= 0 || product.stock <= 0) {
        return items
      }

      const existing = items.find((item) => item.productId === action.productId)
      if (existing) {
        const nextQuantity = Math.min(product.stock, existing.quantity + quantity)
        if (nextQuantity === existing.quantity) return items

        return items.map((item) =>
          item.productId === action.productId
            ? { ...item, quantity: nextQuantity }
            : item,
        )
      }

      return [...items, { productId: action.productId, quantity: Math.min(quantity, product.stock) }]
    }

    case 'SET_QTY': {
      const product = productsById.get(action.productId)
      if (!product) return items

      if (action.quantity <= 0) {
        return items.filter((item) => item.productId !== action.productId)
      }

      if (!Number.isFinite(action.quantity)) return items
      if (product.stock <= 0) {
        return items.filter((item) => item.productId !== action.productId)
      }

      const quantity = Math.min(product.stock, Math.max(1, Math.floor(action.quantity)))

      return items.map((item) =>
        item.productId === action.productId ? { ...item, quantity } : item,
      )
    }

    case 'REMOVE':
      return items.filter((item) => item.productId !== action.productId)

    case 'CLEAR':
      return []

    default:
      return items
  }
}

function readStoredItems() {
  let serialized

  try {
    serialized = localStorage.getItem(CART_STORAGE_KEY)
  } catch (error) {
    console.error('Unable to read the saved cart from local storage.', error)
    return []
  }

  if (!serialized) return []

  let parsed
  try {
    parsed = JSON.parse(serialized)
  } catch (error) {
    console.error('The saved cart is not valid JSON.', error)
    return []
  }

  if (!Array.isArray(parsed)) {
    console.warn('The saved cart has an invalid format and was ignored.')
    return []
  }

  const restoredItems = []
  for (const item of parsed) {
    const product = productsById.get(item?.productId)
    if (
      !product ||
      product.stock <= 0 ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      console.warn('An invalid saved cart line was ignored.')
      continue
    }

    const existing = restoredItems.find((line) => line.productId === item.productId)
    if (existing) {
      existing.quantity = Math.min(product.stock, existing.quantity + item.quantity)
    } else {
      restoredItems.push({
        productId: item.productId,
        quantity: Math.min(product.stock, item.quantity),
      })
    }
  }

  return restoredItems
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, readStoredItems)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Unable to save the cart to local storage.', error)
    }
  }, [items])

  const addItem = useCallback((productId, quantity) => {
    if (!productsById.has(productId)) {
      throw new Error(`Cannot add unknown product "${productId}" to the cart.`)
    }
    dispatch({ type: 'ADD', productId, quantity })
  }, [])

  const setQuantity = useCallback((productId, quantity) => {
    if (!productsById.has(productId)) {
      throw new Error(`Cannot update unknown product "${productId}" in the cart.`)
    }
    dispatch({ type: 'SET_QTY', productId, quantity })
  }, [])

  const removeItem = useCallback((productId) => {
    dispatch({ type: 'REMOVE', productId })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const value = useMemo(
    () => ({
      items,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      isOpen,
      openCart,
      closeCart,
    }),
    [items, addItem, setQuantity, removeItem, clearCart, isOpen, openCart, closeCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

