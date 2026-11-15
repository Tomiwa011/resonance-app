import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/formatPrice'
import styles from './ProductCard.module.css'

function ProductCard({ product }) {
  return (
    <Link className={styles.card} to={`/product/${product.slug}`}>
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
          <span className={styles.rating} aria-label={`Rated ${product.rating} out of 5`}>
            <span aria-hidden="true">★</span> {product.rating}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
