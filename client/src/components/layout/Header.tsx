import { Link, NavLink } from 'react-router-dom'
import { useCart, useCartDetails } from '../../context/useCart'
import styles from './Header.module.css'

const categories = [
  { label: 'Speakers', slug: 'speakers' },
  { label: 'Headphones', slug: 'headphones' },
  { label: 'Earphones', slug: 'earphones' },
  { label: 'Amplifiers', slug: 'amplifiers' },
  { label: 'Turntables', slug: 'turntables' },
]

function Header() {
  const { openCart } = useCart()
  const { itemCount } = useCartDetails()

  return (
    <header className={styles.header}>
      <Link className={styles.logo} to="/" aria-label="Resonance home">
        Resonance
      </Link>

      <nav className={styles.navigation} aria-label="Product categories">
        {categories.map(({ label, slug }) => (
          <NavLink
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
            key={slug}
            to={`/category/${slug}`}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        className={styles.cartButton}
        id="header-cart-button"
        type="button"
        aria-label={itemCount > 0 ? `Shopping cart, ${itemCount} items` : 'Shopping cart'}
        onClick={openCart}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        >
          <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 1.9-1.4L21 8H6" />
          <circle cx="10" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
        </svg>
        {itemCount > 0 && (
          <span className={styles.cartCount} aria-hidden="true">
            {itemCount}
          </span>
        )}
      </button>
    </header>
  )
}

export default Header
