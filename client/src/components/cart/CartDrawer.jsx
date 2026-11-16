import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/formatPrice'
import { useCart, useCartDetails } from '../../context/useCart'
import styles from './CartDrawer.module.css'

function CartDrawer() {
  const { isOpen, closeCart, setQuantity, removeItem } = useCart()
  const { lines, isLoading, itemCount, subtotal } = useCartDetails()
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeCart()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      document.getElementById('header-cart-button')?.focus()
    }
  }, [isOpen, closeCart])

  if (!isOpen) return null

  return (
    <div className={styles.layer}>
      <button
        aria-label="Close shopping cart"
        aria-hidden="true"
        className={styles.overlay}
        onClick={closeCart}
        tabIndex={-1}
        type="button"
      />
      <aside
        aria-label="Shopping cart"
        aria-modal="true"
        className={styles.drawer}
        role="dialog"
        tabIndex={-1}
      >
        <header className={styles.header}>
          <h2>Your cart ({itemCount})</h2>
          <button
            aria-label="Close cart"
            className={styles.closeButton}
            onClick={closeCart}
            ref={closeButtonRef}
            type="button"
          >
            ×
          </button>
        </header>

        {isLoading ? (
          <p className={styles.emptyState} role="status">
            Loading your cart...
          </p>
        ) : lines.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Your cart is empty.</p>
            <Link className={styles.continueButton} onClick={closeCart} to="/">
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className={styles.items}>
              {lines.map(({ product, quantity, lineTotal }) => (
                <li className={styles.item} key={product.id}>
                  <img
                    alt={product.name}
                    className={styles.image}
                    src={product.images[0]}
                  />
                  <div className={styles.itemDetails}>
                    <h3>{product.name}</h3>
                    <p className={styles.unitPrice}>{formatPrice(product.price)}</p>
                    <div className={styles.itemControls}>
                      <div
                        aria-label={`${product.name} quantity`}
                        className={styles.quantityControl}
                        role="group"
                      >
                        <button
                          aria-label={`Decrease ${product.name} quantity`}
                          disabled={quantity <= 1}
                          onClick={() => setQuantity(product.id, quantity - 1,product.stock)}
                          type="button"
                        >
                          −
                        </button>
                        <span>{quantity}</span>
                        <button
                          aria-label={`Increase ${product.name} quantity`}
                          disabled={quantity >= product.stock}
                          onClick={() => setQuantity(product.id, quantity + 1,product.stock)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      <strong>{formatPrice(lineTotal)}</strong>
                    </div>
                    <button
                      aria-label={`Remove ${product.name}`}
                      className={styles.removeButton}
                      onClick={() => removeItem(product.id)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <footer className={styles.footer}>
              <div className={styles.subtotal}>
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <Link className={styles.checkoutButton} onClick={closeCart} to="/checkout">
                Checkout
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}

export default CartDrawer
