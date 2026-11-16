import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import styles from './Footer.module.css'

const categories = [
  { label: 'Headphones', slug: 'headphones' },
  { label: 'Speakers', slug: 'speakers' },
  { label: 'Earphones', slug: 'earphones' },
  { label: 'Amplifiers', slug: 'amplifiers' },
  { label: 'Turntables', slug: 'turntables' },
]

function Footer() {
  const topRevealRef = useScrollReveal()
  const contentRevealRef = useScrollReveal()
  const bottomRevealRef = useScrollReveal()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top} data-scroll-reveal ref={topRevealRef}>
          <div className={styles.brand}>
            <Link className={styles.logo} to="/">
              Resonance<span>.</span>
            </Link>
            <p>Thoughtfully made sound for the moments that matter.</p>
          </div>

          <div className={styles.socials}>
            <p className={styles.eyebrow}>Follow along</p>
            <ul aria-label="Social media" className={styles.socialList}>
              <li>
                <span aria-label="Instagram" className={styles.socialIcon}>
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <rect height="16" rx="4" width="16" x="4" y="4" />
                    <circle cx="12" cy="12" r="3.5" />
                    <circle className={styles.socialDot} cx="17.5" cy="6.8" r="1" />
                  </svg>
                </span>
              </li>
              <li>
                <span aria-label="Facebook" className={styles.socialIcon}>
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M13.5 20v-7h2.4l.4-2.8h-2.8V8.4c0-.8.3-1.4 1.4-1.4h1.5V4.5c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 4v1.8H8v2.8h2.3v7h3.2Z" />
                  </svg>
                </span>
              </li>
              <li>
                <span aria-label="YouTube" className={styles.socialIcon}>
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M21 8.2a2.6 2.6 0 0 0-1.8-1.8C17.6 6 12 6 12 6s-5.6 0-7.2.4A2.6 2.6 0 0 0 3 8.2a27 27 0 0 0-.4 3.8 27 27 0 0 0 .4 3.8 2.6 2.6 0 0 0 1.8 1.8C6.4 18 12 18 12 18s5.6 0 7.2-.4a2.6 2.6 0 0 0 1.8-1.8 27 27 0 0 0 .4-3.8 27 27 0 0 0-.4-3.8ZM10 15V9l5 3-5 3Z" />
                  </svg>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.content} data-scroll-reveal ref={contentRevealRef}>
          <nav aria-label="Shop categories" className={styles.navigation}>
            <h2 className={styles.eyebrow}>Explore</h2>
            <ul>
              <li>
                <Link to="/shop">Shop all</Link>
              </li>
              {categories.map(({ label, slug }) => (
                <li key={slug}>
                  <Link to={`/category/${slug}`}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="newsletter-title" className={styles.newsletter}>
            <p className={styles.eyebrow}>The Resonance note</p>
            <h2 id="newsletter-title">A little more good sound.</h2>
            <p className={styles.newsletterText}>
              Get product news and listening inspiration, occasionally.
            </p>
            <NewsletterForm />
            <p className={styles.disclaimer}>Sign-up is a preview and doesn’t store your email yet.</p>
          </section>
        </div>

        <div className={styles.bottom} data-scroll-reveal ref={bottomRevealRef}>
          <p>© {new Date().getFullYear()} Resonance. Thoughtfully made sound.</p>
          <button
            aria-label="Back to top"
            className={styles.backToTop}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            type="button"
          >
            Back to top <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>
    </footer>
  )
}

function NewsletterForm() {
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Thanks for your interest. Email sign-up is not connected yet.')
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.visuallyHidden} htmlFor="newsletter-email">
        Email address
      </label>
      <input
        autoComplete="email"
        id="newsletter-email"
        name="email"
        placeholder="Your email address"
        required
        type="email"
      />
      <button type="submit">
        Subscribe <span aria-hidden="true">→</span>
      </button>
      {message && (
        <p className={styles.formMessage} role="status">
          {message}
        </p>
      )}
    </form>
  )
}

export default Footer
