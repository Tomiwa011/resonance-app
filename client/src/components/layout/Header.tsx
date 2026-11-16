import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
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
  const { pathname } = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const menu = menuRef.current
    if (!menu) return

    if (isMenuOpen && !menu.open) {
      menu.showModal()
    } else if (!isMenuOpen && menu.open) {
      menu.close()
    }
  }, [isMenuOpen])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMenuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMenuOpen])

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
        aria-controls="mobile-navigation"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        className={styles.menuButton}
        onClick={() => setIsMenuOpen((open) => !open)}
        type="button"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        >
          {isMenuOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

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

      <dialog
        aria-label="Navigation menu"
        className={styles.mobileMenu}
        id="mobile-navigation"
        onClose={() => setIsMenuOpen(false)}
        ref={menuRef}
      >
        <div className={styles.mobileMenuHeader}>
          <Link
            className={styles.logo}
            onClick={() => setIsMenuOpen(false)}
            to="/"
          >
            Resonance
          </Link>
          <button
            aria-label="Close navigation menu"
            className={styles.closeButton}
            onClick={() => setIsMenuOpen(false)}
            type="button"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <nav aria-label="Mobile navigation" className={styles.mobileNavigation}>
          <NavLink
            className={styles.mobileNavLink}
            onClick={() => setIsMenuOpen(false)}
            to="/"
          >
            Home
          </NavLink>
          <NavLink
            className={styles.mobileNavLink}
            onClick={() => setIsMenuOpen(false)}
            to="/shop"
          >
            Shop all
          </NavLink>
          {categories.map(({ label, slug }) => (
            <NavLink
              className={({ isActive }) =>
                isActive
                  ? `${styles.mobileNavLink} ${styles.active}`
                  : styles.mobileNavLink
              }
              key={slug}
              onClick={() => setIsMenuOpen(false)}
              to={`/category/${slug}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </dialog>
    </header>
  )
}

export default Header
