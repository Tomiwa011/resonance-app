import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { getProductsByIds } from '../data/queries.js'

const CartContext = createContext(null)

// New key: product ids changed from strings to database numbers,
// so old saved carts from the mock data are ignored.
const STORAGE_KEY = 'resonance-cart-v2'

const toWholeNumber = (value) => {
  const number = Math.floor(Number(value))
  return Number.isFinite(number) ? number : 0
}

const readInitialItems = () => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(stored)) return []

    const merged = new Map()
    stored.forEach((item) => {
      const productId = Number(item?.productId)
      const quantity = toWholeNumber(item?.quantity)
      if (!Number.isInteger(productId) || productId < 1 || quantity < 1) return
      merged.set(productId, (merged.get(productId) ?? 0) + quantity)
    })

    return [...merged].map(([productId, quantity]) => ({ productId, quantity }))
  } catch (error) {
    console.warn('Unable to load the saved cart; starting with an empty cart.', error)
    return []
  }
}

// `max` is the product's stock, supplied by the caller.
// The server checks stock again at checkout, so this is only for a good UI.
const reducer = (items, action) => {
  switch (action.type) {
    case 'ADD': {
      const productId = Number(action.productId)
      const quantity = toWholeNumber(action.quantity)
      const max = action.max ?? Infinity

      if (!Number.isInteger(productId) || productId < 1 || quantity < 1 || max < 1) {
        return items
      }

      const existing = items.find((item) => item.productId === productId)
      if (existing) {
        return items.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(max, item.quantity + quantity) }
            : item,
        )
      }

      return [...items, { productId, quantity: Math.min(max, quantity) }]
    }
    case 'SET_QTY': {
      const quantity = toWholeNumber(action.quantity)
      const max = action.max ?? Infinity

      if (quantity < 1) {
        return items.filter((item) => item.productId !== action.productId)
      }

      return items.map((item) =>
        item.productId === action.productId
          ? { ...item, quantity: Math.min(max, quantity) }
          : item,
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

export const CartProvider = ({ children }) => {
  const [items, dispatch] = useReducer(reducer, undefined, readInitialItems)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Unable to save the cart to local storage.', error)
    }
  }, [items])

  const addItem = useCallback(
    (productId, quantity, max) => dispatch({ type: 'ADD', productId, quantity, max }),
    [],
  )
  const setQuantity = useCallback(
    (productId, quantity, max) => dispatch({ type: 'SET_QTY', productId, quantity, max }),
    [],
  )
  const removeItem = useCallback(
    (productId) => dispatch({ type: 'REMOVE', productId }),
    [],
  )
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), [])
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
    [items, isOpen, addItem, setQuantity, removeItem, clearCart, openCart, closeCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Joins the cart's { productId, quantity } items with product data from the API.
// eslint-disable-next-line react-refresh/only-export-components
export const useCartDetails = () => {
  const { items } = useCart()
  const [productMap, setProductMap] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Only refetch when the SET of products changes, not when a quantity changes.
  const idsKey = items.map((item) => item.productId).join(',')

  useEffect(() => {
    if (!idsKey) return undefined

    let isCurrent = true
    setIsLoading(true)

    getProductsByIds(idsKey.split(',').map(Number)).then((products) => {
      if (!isCurrent) return
      setProductMap(Object.fromEntries(products.map((product) => [product.id, product])))
      setIsLoading(false)
    })

    return () => {
      isCurrent = false
    }
  }, [idsKey])

  return useMemo(() => {
    const lines = items.flatMap((item) => {
      const product = productMap[item.productId]
      if (!product || product.stock < 1) return []

      const quantity = Math.min(item.quantity, product.stock)
      return [{ product, quantity, lineTotal: product.price * quantity }]
    })

    return {
      lines,
      isLoading,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: lines.reduce((total, line) => total + line.lineTotal, 0),
    }
  }, [items, productMap, isLoading])
}