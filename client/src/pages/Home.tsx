import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ui/ProductCard.jsx'
import { getProductsByCategory } from '../data/queries.js'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import styles from './Home.module.css'

type FeaturedProduct = {
  slug: string
  isNew: boolean
  rating: number
}

const categories = [
  { name: 'Headphones', slug: 'headphones', image: '/images/products/xx99-mark-ii-1.jpg' },
  { name: 'Speakers', slug: 'speakers', image: '/images/products/zx9-1.jpg' },
  { name: 'Earphones', slug: 'earphones', image: '/images/products/yx1-1.jpg' },
  { name: 'Amplifiers', slug: 'amplifiers', image: '/images/products/a1-1.jpg' },
  { name: 'Turntables', slug: 'turntables', image: '/images/products/t1-1.jpg' },
]

function Home() {
  const [productState, setProductState] = useState<{
    products: FeaturedProduct[]
    loading: boolean
    error: boolean
  }>({
    products: [],
    loading: true,
    error: false,
  })
  const heroRef = useScrollReveal()
  const categoriesRef = useScrollReveal()
  const featuredRef = useScrollReveal()
  const promiseRef = useScrollReveal()

  useEffect(() => {
    let isCurrent = true

    getProductsByCategory()
      .then((products) => {
        if (isCurrent) setProductState({ products, loading: false, error: false })
      })
      .catch((error) => {
        if (!isCurrent) return
        console.error('Could not load homepage products', error)
        setProductState({ products: [], loading: false, error: true })
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const featuredProducts = [...productState.products]
    .sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.rating - a.rating)
    .slice(0, 3)

  return (
    <div className={styles.page}>
      <section className={styles.hero} data-scroll-reveal ref={heroRef}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Thoughtfully made sound</p>
          <h1>Hear more in every moment.</h1>
          <p className={styles.heroText}>
            Find your next favourite sound, from focused listening to a room-filling setup.
          </p>
          <Link className={styles.heroButton} to="/category/headphones">
            Explore headphones
            <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className={styles.heroImageWrap}>
          <img
            alt="Resonance ZX9 speaker"
            className={styles.heroImage}
            fetchPriority="high"
            src="/images/products/zx9-1.jpg"
          />
          <span className={styles.heroNote}>Sound that brings you closer.</span>
        </div>
        <span className={styles.heroIndex} aria-hidden="true">01 / RESONANCE</span>
      </section>

      <section
        aria-labelledby="categories-title"
        className={styles.categories}
        data-scroll-reveal
        ref={categoriesRef}
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Find your sound</p>
            <h2 id="categories-title">Shop by category</h2>
          </div>
          <p>Made for the way you listen.</p>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((category, index) => (
            <Link
              className={styles.categoryCard}
              key={category.slug}
              to={`/category/${category.slug}`}
            >
              <span className={styles.categoryNumber}>0{index + 1}</span>
              <img alt="" loading="lazy" src={category.image} />
              <span className={styles.categoryName}>
                {category.name}
                <span aria-hidden="true">↗</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="featured-title"
        className={styles.featured}
        data-scroll-reveal
        ref={featuredRef}
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>A good place to start</p>
            <h2 id="featured-title">Selected for you</h2>
          </div>
          <Link className={styles.textLink} to="/shop">
            Browse everything <span aria-hidden="true">→</span>
          </Link>
        </div>

        {productState.loading ? (
          <div className={styles.loadingState} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            Finding your next favourite...
          </div>
        ) : productState.error ? (
          <p className={styles.message} role="alert">
            We couldn’t load products right now. Please try again in a moment.
          </p>
        ) : featuredProducts.length > 0 ? (
          <div className={styles.productGrid}>
            {featuredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <p className={styles.message}>Products are coming soon.</p>
        )}
      </section>

      <section
        aria-label="Our promise"
        className={styles.promise}
        data-scroll-reveal
        ref={promiseRef}
      >
        <span className={styles.promiseMark} aria-hidden="true">R.</span>
        <div>
          <p className={styles.eyebrow}>Listen a little closer</p>
          <h2>Considered design. Honest sound.</h2>
        </div>
        <p>Thoughtful essentials for the moments, music, and people that matter.</p>
      </section>
    </div>
  )
}

export default Home
