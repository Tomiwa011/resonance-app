import { Link, useLocation } from 'react-router-dom'
import styles from './OrderConfirmation.module.css'

function OrderConfirmation() {
  const location = useLocation()
  const orderNumber = location.state?.orderNumber

  return (
    <section className={styles.page}>
      <h1>Thank you, your order is placed</h1>
      {orderNumber && <p>Your order number is {orderNumber}.</p>}
      <Link to="/">Continue shopping</Link>
    </section>
  )
}

export default OrderConfirmation
