import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ui/ProductCard.jsx";
import { useCart } from "../context/useCart.js";
import { useScrollReveal } from "../hooks/useScrollReveal.js";
import { getProductBySlug, getRelatedProducts } from "../data/queries.js";
import { formatPrice } from "../utils/formatPrice.js";
import styles from "./Product.module.css";

function Product() {
  const { slug } = useParams();
  const { addItem, openCart } = useCart();
  const topSectionRef = useScrollReveal();
  const informationRef = useScrollReveal();
  const relatedRef = useScrollReveal();
  const [productState, setProductState] = useState(() => ({
    slug,
    product: null,
    loading: true,
  }));
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("specs");
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    let isCurrentProduct = true;

    getProductBySlug(slug).then((nextProduct) => {
      if (!isCurrentProduct) return;

      setProductState({ slug, product: nextProduct, loading: false });
      setSelectedImage(nextProduct?.images[0] ?? null);
      setQuantity(1);
      setActiveTab("specs");
      setRelatedProducts([]);
    });

    return () => {
      isCurrentProduct = false;
    };
  }, [slug]);

  const loading = productState.slug !== slug || productState.loading;
  const product = loading ? null : productState.product;

  useEffect(() => {
    if (!product) return;

    let isCurrentProduct = true;

    getRelatedProducts(product).then((items) => {
      if (isCurrentProduct) setRelatedProducts(items);
    });

    return () => {
      isCurrentProduct = false;
    };
  }, [product]);

  function handleAddToCart() {
    addItem(product.id, quantity,product.stock);
    openCart();
  }

  if (loading) {
    return (
      <p className={styles.message} role="status">
        Loading product...
      </p>
    );
  }

  if (!product) {
    return (
      <section className={styles.message}>
        <h1>Product not found</h1>
        <p>
          We couldn’t find that product. It may have moved or been discontinued.
        </p>
        <Link className={styles.homeLink} to="/">
          Back to home
        </Link>
      </section>
    );
  }

  const tabs = [
    { id: "specs", label: "Specs" },
    { id: "features", label: "Features" },
    { id: "box", label: "In the Box" },
  ];

  return (
    <div className={styles.page}>
      <section className={styles.topSection} data-scroll-reveal ref={topSectionRef}>
        <div className={styles.gallery}>
          <div className={styles.mainImageBox}>
            <img
              className={styles.mainImage}
              src={selectedImage}
              alt={product.name}
            />
          </div>
          <div className={styles.thumbnails} aria-label="Product images">
            {product.images.slice(0, 3).map((image, index) => (
              <button
                aria-label={`Show image ${index + 1}`}
                aria-pressed={selectedImage === image}
                className={`${styles.thumbnailButton} ${
                  selectedImage === image ? styles.selectedThumbnail : ""
                }`}
                key={image}
                onClick={() => setSelectedImage(image)}
                type="button"
              >
                <img src={image} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.details}>
          {product.isNew && <span className={styles.newTag}>New</span>}
          <h1>{product.name}</h1>
          <p className={styles.description}>{product.description}</p>
          <p className={styles.price}>{formatPrice(product.price)}</p>
          {product.stock === 0 ? (
            <p className={styles.stockHint}>Out of stock</p>
          ) : product.stock <= 5 ? (
            <p className={styles.stockHint}>Only {product.stock} left</p>
          ) : null}

          <div className={styles.purchaseRow}>
            <div
              aria-label="Quantity"
              className={styles.quantityControl}
              role="group"
            >
              <button
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
                type="button"
              >
                −
              </button>
              <output aria-live="polite">{quantity}</output>
              <button
                aria-label="Increase quantity"
                disabled={quantity >= product.stock}
                onClick={() =>
                  setQuantity((current) => Math.min(product.stock, current + 1))
                }
                type="button"
              >
                +
              </button>
            </div>
            <button
              className={styles.addButton}
              onClick={handleAddToCart}
              disabled={product.stock < 1}
              type="button"
            >
              {product.stock < 1 ? "Out of stock" : "Add to cart"}
            </button>
          </div>
        </div>
      </section>

      <section
        aria-label="Product information"
        className={styles.information}
        data-scroll-reveal
        ref={informationRef}
      >
        <div
          className={styles.tabList}
          role="tablist"
          aria-label="Product details"
        >
          {tabs.map((tab) => (
            <button
              aria-controls="product-tabpanel"
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? styles.activeTab : ""}
              id={`product-tab-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          aria-labelledby={`product-tab-${activeTab}`}
          className={styles.tabPanel}
          id="product-tabpanel"
          role="tabpanel"
          tabIndex={0}
        >
          {activeTab === "specs" && (
            <table className={styles.specsTable}>
              <tbody>
                {product.specs.map((spec) => (
                  <tr key={spec.label}>
                    <th scope="row">{spec.label}</th>
                    <td>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === "features" &&
            product.features.map((feature, index) => (
              <p key={index}>{feature}</p>
            ))}
          {activeTab === "box" && (
            <ul className={styles.boxList}>
              {product.inTheBox.map((item) => (
                <li key={item.item}>
                  <span>{item.quantity} x</span> {item.item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className={styles.related} data-scroll-reveal ref={relatedRef}>
          <h2>Pairs well with</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Product;
