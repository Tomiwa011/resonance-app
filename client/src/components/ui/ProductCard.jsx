import { Link } from 'react-router-dom'
import { useCart } from '../../context/useCart'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { formatPrice } from '../../utils/formatPrice'
import styles from './ProductCard.module.css'

function ProductCard({ product }) {
  const { addItem, openCart } = useCart()
  const revealRef = useScrollReveal()

  function handleQuickAdd() {
    addItem(product.id, 1, product.stock)
    openCart()
  }

  return (
    <article className={styles.card} data-scroll-reveal ref={revealRef}>
      <Link className={styles.productLink} to={`/product/${product.slug}`}>
        <div className={styles.imageBox}>
          {product.isNew && <span className={styles.newTag}>New</span>}
          <img
            alt={product.name}
            className={styles.image}
            loading="lazy"
            src={product.images[0]}
          />
        </div>
        <div className={styles.details}>
          <span className={styles.category}>{product.category}</span>
          <h3 className={styles.name}>{product.name}</h3>
          <div className={styles.meta}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            {product.rating > 0 && (
              <span className={styles.rating} aria-label={`Rated ${product.rating} out of 5`}>
                <span aria-hidden="true">★</span> {product.rating}
              </span>
            )}
          </div>
          <p className={product.stock > 0 ? styles.stock : styles.outOfStock}>
            {product.stock > 0
              ? product.stock <= 5
                ? `Only ${product.stock} left`
                : 'In stock'
              : 'Out of stock'}
          </p>
        </div>
      </Link>
      <button
        aria-label={`Add ${product.name} to cart`}
        className={styles.quickAdd}
        disabled={product.stock < 1}
        onClick={handleQuickAdd}
        type="button"
      >
        {product.stock > 0 ? 'Quick add' : 'Sold out'}
        {product.stock > 0 && <span aria-hidden="true">+</span>}
      </button>
    </article>
  )
}

export default ProductCard
