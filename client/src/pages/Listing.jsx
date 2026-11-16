import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ui/ProductCard.jsx";
import { getProductsByCategory } from "../data/queries.js";
import styles from "./Listing.module.css";

const EMPTY_PRODUCTS = [];

function Listing() {
  const { category } = useParams();
  const [productState, setProductState] = useState({
    category: null,
    items: [],
    error: null,
  });
  const [maxPrice, setMaxPrice] = useState(null);
  const [brands, setBrands] = useState([]);
  const [sort, setSort] = useState("featured");
  const isLoading = productState.category !== category;
  const items = isLoading ? EMPTY_PRODUCTS : productState.items;

  const categoryName = category
    ? `${category.charAt(0).toUpperCase()}${category.slice(1)}`
    : "Products";

  useEffect(() => {
    let isCurrentCategory = true;

    getProductsByCategory(category)
      .then((products) => {
        if (!isCurrentCategory) return;

        setMaxPrice(null);
        setBrands([]);
        setSort("featured");
        setProductState({ category, items: products, error: null });
      })
      .catch((error) => {
        if (!isCurrentCategory) return;
        console.error("Could not load products", error);
        setProductState({ category, items: [], error });
      });

    return () => {
      isCurrentCategory = false;
    };
  }, [category]);

  const maxAvailablePrice = items.length
    ? Math.max(...items.map((product) => product.price))
    : 0;

  const visible = useMemo(() => {
    let result = [...items];

    if (maxPrice !== null) {
      result = result.filter((product) => product.price <= maxPrice);
    }

    if (brands.length > 0) {
      result = result.filter((product) => brands.includes(product.brand));
    }

    if (sort === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [items, maxPrice, brands, sort]);

  const hasActiveFilters =
    maxPrice !== null || brands.length > 0 || sort !== "featured";

  function clearFilters() {
    setMaxPrice(null);
    setBrands([]);
    setSort("featured");
  }

  function toggleBrand(brand) {
    setBrands((selected) =>
      selected.includes(brand)
        ? selected.filter((item) => item !== brand)
        : [...selected, brand],
    );
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{categoryName}</h1>
      <div className={styles.layout}>
        <aside aria-label="Filters" className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <label className={styles.filterTitle} htmlFor="max-price">
              Maximum price
            </label>
            <input
              className={styles.range}
              disabled={isLoading || items.length === 0}
              id="max-price"
              max={maxAvailablePrice}
              min="0"
              onChange={(event) => {
                const value = Number(event.target.value);
                setMaxPrice(value === maxAvailablePrice ? null : value);
              }}
              type="range"
              value={maxPrice ?? maxAvailablePrice}
            />
            <span className={styles.priceValue}>
              {maxPrice === null ? "No limit" : maxPrice}
            </span>
          </div>

          <fieldset className={styles.filterGroup}>
            <legend className={styles.filterTitle}>Brand</legend>
            {[...new Set(items.map((product) => product.brand))].map(
              (brand) => (
                <label className={styles.brandOption} key={brand}>
                  <input
                    checked={brands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    disabled={isLoading}
                    type="checkbox"
                    value={brand}
                  />
                  {brand}
                </label>
              ),
            )}
          </fieldset>

          {hasActiveFilters && (
            <button
              className={styles.clearButton}
              onClick={clearFilters}
              type="button"
            >
              Clear filters
            </button>
          )}
        </aside>
        <div className={styles.results}>
          <div className={styles.sortBar}>
            <span>
              {isLoading
                ? "Loading products..."
                : `${visible.length} ${visible.length === 1 ? "product" : "products"}`}
            </span>
            <label className={styles.sortControl}>
              <span>Sort by</span>
              <select
                disabled={isLoading}
                onChange={(event) => setSort(event.target.value)}
                value={sort}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </label>
          </div>
          {isLoading ? (
            <div className={styles.loadingState} role="status" aria-live="polite">
              <span className={styles.spinner} aria-hidden="true" />
              Loading {categoryName.toLowerCase()}...
            </div>
          ) : productState.error ? (
            <div className={styles.emptyState} role="alert">
              <p>Products couldn’t be loaded. Please try again.</p>
            </div>
          ) : visible.length > 0 ? (
            <div className={styles.productGrid}>
              {visible.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>
                {items.length === 0
                  ? "No products in this category yet."
                  : "No products match these filters."}
              </p>
              {hasActiveFilters && (
                <button
                  className={styles.clearButton}
                  onClick={clearFilters}
                  type="button"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Listing;
