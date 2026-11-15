import { Link, Navigate, useLocation } from 'react-router-dom'
import { formatPrice } from '../utils/formatPrice.js'
import styles from './OrderConfirmation.module.css'

const OrderConfirmation = () => {
  const { state } = useLocation()
  const order = state?.order

  // Someone opened this URL directly or refreshed after leaving the flow.
  if (!order) return <Navigate to="/" replace />

  return (
    <main className={styles.page}>
      <h1>Thank you, your order is placed</h1>
      <p className={styles.muted}>
        Order number <strong>{order.orderNumber}</strong>. Keep it for your records.
      </p>

      <ul className={styles.lines}>
        {order.items.map((item) => (
          <li key={item.productId}>
            <span>
              {item.quantity} x {item.name}
            </span>
            <span>{formatPrice(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <dl className={styles.totals}>
        <div>
          <dt>Subtotal</dt>
          <dd>{formatPrice(order.subtotal)}</dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>{formatPrice(order.deliveryFee)}</dd>
        </div>
        <div className={styles.grandTotal}>
          <dt>Total</dt>
          <dd>{formatPrice(order.total)}</dd>
        </div>
      </dl>

      <p className={styles.muted}>You'll pay on delivery.</p>

      <Link className={styles.button} to="/">
        Continue shopping
      </Link>
    </main>
  )
}

export default OrderConfirmation