import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart, useCartDetails } from '../context/useCart.js'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { createOrder } from '../data/orders.js'
import { formatPrice } from '../utils/formatPrice.js'
import styles from './Checkout.module.css'

// Must match DELIVERY_FEE in the backend's orders.service.js.
// The server's total is the one that counts.
const DELIVERY_FEE = 5000

const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
]

const FIELD_ORDER = ['name', 'email', 'phone', 'address', 'city', 'state']

const EMPTY_VALUES = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  notes: '',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^(0\d{10}|\+234\d{10})$/

const validateField = (name, rawValue) => {
  const value = rawValue.trim()

  switch (name) {
    case 'name':
      if (value.length < 2) return 'Enter your full name'
      return ''
    case 'email':
      if (!value) return 'Enter your email address'
      if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email address'
      return ''
    case 'phone': {
      const digits = value.replace(/[\s-]/g, '')
      if (!digits) return 'Enter your phone number'
      if (!PHONE_PATTERN.test(digits)) {
        return 'Use a Nigerian number like 08012345678 or +2348012345678'
      }
      return ''
    }
    case 'address':
      if (value.length < 5) return 'Enter your street address'
      return ''
    case 'city':
      if (!value) return 'Enter your city'
      return ''
    case 'state':
      if (!value) return 'Choose your state'
      return ''
    default:
      return ''
  }
}

const validate = (values) => {
  const errors = {}
  FIELD_ORDER.forEach((name) => {
    const message = validateField(name, values[name])
    if (message) errors[name] = message
  })
  return errors
}

function Field({ name, label, as: Tag = 'input', error, children, ...props }) {
  const errorId = `error-${name}`

  return (
    <div className={styles.field}>
      <label htmlFor={`field-${name}`}>{label}</label>
      <Tag
        id={`field-${name}`}
        name={name}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      >
        {children}
      </Tag>
      {error && (
        <p className={styles.error} id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}

const Checkout = () => {
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const { lines, itemCount, subtotal } = useCartDetails()
  const formRevealRef = useScrollReveal()
  const summaryRevealRef = useScrollReveal()

  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  if (itemCount === 0) {
    return (
      <main className={styles.message}>
        <h1>Your cart is empty</h1>
        <p>Add something to your cart before checking out.</p>
        <Link className={styles.linkButton} to="/">
          Continue shopping
        </Link>
      </main>
    )
  }

  if (lines.length === 0) {
    return <main className={styles.message}>Loading your order...</main>
  }

  const total = subtotal + DELIVERY_FEE

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))

    // Once a field shows an error, re-check it as the user types so it clears as soon as it's fixed.
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: validateField(name, value) }))
    }
  }

  const handleBlur = (event) => {
    const { name, value } = event.target
    if (!FIELD_ORDER.includes(name)) return
    setErrors((current) => ({ ...current, [name]: validateField(name, value) }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validate(values)
    setErrors(nextErrors)
    setSubmitError('')

    const firstInvalid = FIELD_ORDER.find((name) => nextErrors[name])
    if (firstInvalid) {
      document.getElementById(`field-${firstInvalid}`)?.focus()
      return
    }

    setIsSubmitting(true)

    try {
      const order = await createOrder({
        customer: {
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          address: values.address.trim(),
          city: values.city.trim(),
          state: values.state,
          notes: values.notes.trim(),
        },
        items: lines.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
        })),
      })

      clearCart()
      navigate('/order-confirmation', { state: { order } })
    } catch (error) {
      setSubmitError(error.message)
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <h1>Checkout</h1>

      <div className={styles.layout}>
        <form
          className={styles.form}
          data-scroll-reveal
          onSubmit={handleSubmit}
          noValidate
          ref={formRevealRef}
        >
          <h2>Delivery details</h2>

          <Field
            name="name"
            label="Full name"
            autoComplete="name"
            value={values.name}
            error={errors.name}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <Field
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={values.email}
            error={errors.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <Field
            name="phone"
            label="Phone number"
            type="tel"
            autoComplete="tel"
            placeholder="08012345678"
            value={values.phone}
            error={errors.phone}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <Field
            name="address"
            label="Street address"
            autoComplete="street-address"
            value={values.address}
            error={errors.address}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <div className={styles.row}>
            <Field
              name="city"
              label="City"
              autoComplete="address-level2"
              value={values.city}
              error={errors.city}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <Field
              as="select"
              name="state"
              label="State"
              value={values.state}
              error={errors.state}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="">Choose a state</option>
              {STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </Field>
          </div>
          <Field
            as="textarea"
            name="notes"
            label="Delivery notes (optional)"
            rows={3}
            maxLength={500}
            value={values.notes}
            onChange={handleChange}
          />

          <h2>Payment</h2>
          <p className={styles.muted}>Pay on delivery.</p>

          {submitError && (
            <p className={styles.submitError} role="alert">
              {submitError}
            </p>
          )}

          <button className={styles.submit} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Placing order...' : `Place order · ${formatPrice(total)}`}
          </button>
        </form>

        <aside
          aria-label="Order summary"
          className={styles.summary}
          data-scroll-reveal
          ref={summaryRevealRef}
        >
          <h2>Order summary</h2>

          <ul className={styles.lines}>
            {lines.map(({ product, quantity, lineTotal }) => (
              <li className={styles.line} key={product.id}>
                <img src={product.images[0]} alt="" />
                <div>
                  <p className={styles.lineName}>{product.name}</p>
                  <p className={styles.muted}>Qty {quantity}</p>
                </div>
                <p>{formatPrice(lineTotal)}</p>
              </li>
            ))}
          </ul>

          <dl className={styles.totals}>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{formatPrice(DELIVERY_FEE)}</dd>
            </div>
            <div className={styles.grandTotal}>
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </main>
  )
}

export default Checkout