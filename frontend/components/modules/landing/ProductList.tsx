"use client";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./product-list.module.scss";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "./ProductCard";
import { Search } from "lucide-react";
import { useCategory } from "@/hooks/useCategory";

const FILTERS = ["All", "New arrivals", "Featured", "Fashion", "Home decor", "Beauty", "Jewelry"];

const ProductList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const { isLoading, products, getProducts, error, meta } = useProducts();
  const { categories, getCategories } = useCategory();
  const limit = 12;

  useEffect(() => {
    getProducts({ page, limit, search: debouncedSearch });
  }, [page, debouncedSearch, getProducts]);

  useEffect(() => {
    getCategories();
  }, [])

  //Reset page về 1 khi đổi filter
  const handleFilterClick = useCallback((filter: string) => {
    setActiveFilter(filter);
    setPage(1);

  }, [])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearch(value);
      setPage(1);
      setTimeout(() => {
        setDebouncedSearch(value);
      }, 500);
    },
    [],
  );

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (meta && page < meta.totalPages) setPage(page + 1);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>

        {/* Section header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h2>Our collection</h2>
            <p>Curated products for every taste and occasion.</p>
          </div>
        </div>

        {/* Category filter pills */}
        <div className={styles.filterRow}>
          {categories.map((category, index) => (
            <button
              key={index}
              className={`${styles.pill} ${activeFilter === category.name ? styles.pillActive : ""}`}
              onClick={() => setActiveFilter(category.name)}
            >
              {category.name}
            </button>
          ))}
          {
            categories.length >= 4 && (
              <button

                className={styles.pill}

              >
                More
              </button>
            )
          }

        </div>

        {/* Search bar */}
        <div className={styles.searchBar}>
          <Search size={15} className={styles.searchIcon} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className={styles.loading}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : error ? (
          <div className={styles.empty}>{error}</div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            {debouncedSearch
              ? `No products found for "${debouncedSearch}"`
              : "No products available."}
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className={styles.pagination}>
                <button onClick={handlePrevPage} disabled={page === 1}>
                  ← Previous
                </button>
                <span className={styles.pageInfo}>
                  {page} / {meta.totalPages}
                </span>
                <button onClick={handleNextPage} disabled={page >= meta.totalPages}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* Dark value-prop band */}
        <div className={styles.darkBand}>
          <div className={styles.bandInner}>
            <h3>Quality products, curated for you</h3>
            <p>
              Shop from over 100,000 brands. Every product is vetted for quality
              and craftsmanship — because you deserve the finest.
            </p>
          </div>
        </div>

      </div>
    </section >
  );
};

export default ProductList;
