import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatPrice } from '../utils/formatPrice'
import { useCart, useCartDetails } from '../context/useCart'
import styles from './Checkout.module.css'

const DELIVERY_FEE = 5000

const nigerianStates = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'Federal Capital Territory',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
]

function validate(values) {
  const errors = {}
  const fullName = values.fullName.trim()
  const email = values.email.trim()
  const phone = values.phone.trim()

  if (!fullName) {
    errors.fullName = 'Enter your full name.'
  } else if (fullName.length < 2) {
    errors.fullName = 'Name must be at least 2 characters.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!/^(?:0\d{10}|\+234\d{10})$/.test(phone)) {
    errors.phone = 'Enter a valid Nigerian phone number.'
  }

  if (!values.address.trim()) errors.address = 'Enter your street address.'
  if (!values.city.trim()) errors.city = 'Enter your city.'
  if (!values.state) errors.state = 'Select your state.'

  return errors
}

function Checkout() {
  const navigate = useNavigate()
  const { items, clearCart } = useCart()
  const { lines, subtotal } = useCartDetails()
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    deliveryNotes: '',
  })
  const [errors, setErrors] = useState({})
  const fullNameRef = useRef(null)
  const emailRef = useRef(null)
  const phoneRef = useRef(null)
  const addressRef = useRef(null)
  const cityRef = useRef(null)
  const stateRef = useRef(null)
  const fieldRefs = {
    fullName: fullNameRef,
    email: emailRef,
    phone: phoneRef,
    address: addressRef,
    city: cityRef,
    state: stateRef,
  }

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function validateField(field, value) {
    const message = validate({ ...values, [field]: value })[field]
    setErrors((current) => {
      const next = { ...current }
      if (message) {
        next[field] = message
      } else {
        delete next[field]
      }
      return next
    })
  }

  function errorProps(field) {
    return {
      'aria-invalid': Boolean(errors[field]),
      'aria-describedby': errors[field] ? `${field}-error` : undefined,
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)

    const firstInvalidField = Object.keys(nextErrors)[0]
    if (firstInvalidField) {
      fieldRefs[firstInvalidField]?.current?.focus()
      return
    }

    const customer = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      state: values.state,
      deliveryNotes: values.deliveryNotes.trim(),
    }
    const order = {
      customer,
      items: items.map(({ productId, quantity }) => ({ productId, quantity })),
      subtotal,
      delivery: DELIVERY_FEE,
      total: subtotal + DELIVERY_FEE,
    }
    const orderNumber = `RES-${Date.now()}`

    console.log('Order submitted:', order)
    clearCart()
    navigate('/order-confirmation', { state: { orderNumber } })
  }

  if (items.length === 0) {
    return (
      <section className={styles.emptyState}>
        <h1>Your cart is empty</h1>
        <p>Add something you love before checking out.</p>
        <Link className={styles.primaryLink} to="/category/speakers">
          Continue shopping
        </Link>
      </section>
    )
  }

  return (
    <section className={styles.page}>
      <h1>Checkout</h1>
      <div className={styles.layout}>
        <form className={styles.form} noValidate onSubmit={handleSubmit}>
          <h2>Delivery details</h2>
          <div className={styles.fields}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="fullName">Full name</label>
              <input
                {...errorProps('fullName')}
                autoComplete="name"
                id="fullName"
                onBlur={(event) => validateField('fullName', event.target.value)}
                onChange={(event) => updateValue('fullName', event.target.value)}
                ref={fullNameRef}
                value={values.fullName}
              />
              {errors.fullName && (
                <span className={styles.error} id="fullName-error" role="alert">
                  {errors.fullName}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                {...errorProps('email')}
                autoComplete="email"
                id="email"
                onBlur={(event) => validateField('email', event.target.value)}
                onChange={(event) => updateValue('email', event.target.value)}
                ref={emailRef}
                type="email"
                value={values.email}
              />
              {errors.email && (
                <span className={styles.error} id="email-error" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="phone">Phone</label>
              <input
                {...errorProps('phone')}
                autoComplete="tel"
                id="phone"
                onBlur={(event) => validateField('phone', event.target.value)}
                onChange={(event) => updateValue('phone', event.target.value)}
                ref={phoneRef}
                type="tel"
                value={values.phone}
              />
              {errors.phone && (
                <span className={styles.error} id="phone-error" role="alert">
                  {errors.phone}
                </span>
              )}
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="address">Street address</label>
              <input
                {...errorProps('address')}
                autoComplete="street-address"
                id="address"
                onBlur={(event) => validateField('address', event.target.value)}
                onChange={(event) => updateValue('address', event.target.value)}
                ref={addressRef}
                value={values.address}
              />
              {errors.address && (
                <span className={styles.error} id="address-error" role="alert">
                  {errors.address}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="city">City</label>
              <input
                {...errorProps('city')}
                autoComplete="address-level2"
                id="city"
                onBlur={(event) => validateField('city', event.target.value)}
                onChange={(event) => updateValue('city', event.target.value)}
                ref={cityRef}
                value={values.city}
              />
              {errors.city && (
                <span className={styles.error} id="city-error" role="alert">
                  {errors.city}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="state">State</label>
              <select
                {...errorProps('state')}
                autoComplete="address-level1"
                id="state"
                onBlur={(event) => validateField('state', event.target.value)}
                onChange={(event) => updateValue('state', event.target.value)}
                ref={stateRef}
                value={values.state}
              >
                <option value="">Select a state</option>
                {nigerianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && (
                <span className={styles.error} id="state-error" role="alert">
                  {errors.state}
                </span>
              )}
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="deliveryNotes">Delivery notes (optional)</label>
              <textarea
                autoComplete="off"
                id="deliveryNotes"
                onChange={(event) => updateValue('deliveryNotes', event.target.value)}
                rows="3"
                value={values.deliveryNotes}
              />
            </div>
          </div>

          <button className={styles.placeOrderButton} type="submit">
            Place order
          </button>
        </form>

        <aside className={styles.summary} aria-label="Order summary">
          <h2>Order summary</h2>
          <ul className={styles.summaryLines}>
            {lines.map(({ product, quantity, lineTotal }) => (
              <li key={product.id}>
                <img src={product.images[0]} alt={product.name} />
                <div>
                  <h3>{product.name}</h3>
                  <span>Qty {quantity}</span>
                </div>
                <strong>{formatPrice(lineTotal)}</strong>
              </li>
            ))}
          </ul>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Delivery</span>
            <strong>{formatPrice(DELIVERY_FEE)}</strong>
          </div>
          <div className={`${styles.summaryRow} ${styles.total}`}>
            <span>Total</span>
            <strong>{formatPrice(subtotal + DELIVERY_FEE)}</strong>
          </div>
          <p className={styles.paymentNote}>Payment: Pay on delivery</p>
        </aside>
      </div>
    </section>
  )
}

export default Checkout
