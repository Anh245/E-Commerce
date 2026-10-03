"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, RotateCcw, Search } from "lucide-react";
import { useCategory } from "@/hooks/useCategory";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/modules/landing/ProductCard";
import styles from "./catalog.module.scss";

const PAGE_SIZE = 12;

function CatalogSearchForm({
  initialValue,
  onSearch,
}: {
  initialValue: string;
  onSearch: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form className={styles.searchForm} onSubmit={handleSubmit} role="search">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search products"
        aria-label="Search products"
      />
      <button type="submit" aria-label="Submit product search">
        <Search size={17} aria-hidden="true" />
        <span>Search</span>
      </button>
    </form>
  );
}

export function CatalogLoading() {
  return (
    <main className={styles.section} aria-busy="true" aria-live="polite">
      <div className={styles.container}>
        <p className={styles.loadingMessage}>Loading products...</p>
      </div>
    </main>
  );
}

export default function CatalogClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const filters = new URLSearchParams(queryString);
  const searchQuery = filters.get("search") ?? "";
  const categoryId = filters.get("category") ?? "";
  const parsedPage = Number(filters.get("page") ?? 1);
  const currentPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const { categories, getCategories } = useCategory();
  const { error, getProducts, isLoading, meta, products } = useProducts();

  useEffect(() => {
    void getCategories();
  }, [getCategories]);

  useEffect(() => {
    void getProducts({
      category: categoryId || undefined,
      isActive: true,
      limit: PAGE_SIZE,
      page: currentPage,
      search: searchQuery || undefined,
    });
  }, [categoryId, currentPage, getProducts, searchQuery]);

  const updateQuery = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(queryString);

    Object.entries(changes).forEach(([key, value]) => {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });

    const nextQuery = next.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  };

  const handleSearch = (value: string) => {
    updateQuery({ search: value || null, page: null });
  };

  const handleCategoryChange = (nextCategoryId: string) => {
    updateQuery({ category: nextCategoryId || null, page: null });
  };

  const clearFilters = () => {
    updateQuery({ search: null, category: null, page: null });
  };

  const hasFilters = Boolean(searchQuery || categoryId);

  return (
    <main className={styles.section}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Storefront collection</p>
          <h1>Find your next favorite</h1>
          <p className={styles.intro}>
            Browse the collection or narrow it down by name and category.
          </p>
        </header>

        <CatalogSearchForm
          key={searchQuery}
          initialValue={searchQuery}
          onSearch={handleSearch}
        />

        <section
          className={styles.catalogControls}
          aria-label="Catalog filters"
        >
          <div className={styles.filterHeading}>
            <h2>Categories</h2>
            {hasFilters && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={clearFilters}
              >
                <RotateCcw size={14} aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>

          <div className={styles.categoryList}>
            <button
              type="button"
              className={`${styles.categoryButton} ${!categoryId ? styles.selected : ""}`}
              aria-pressed={!categoryId}
              onClick={() => handleCategoryChange("")}
            >
              All products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`${styles.categoryButton} ${categoryId === category.id ? styles.selected : ""}`}
                aria-pressed={categoryId === category.id}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        <div className={styles.resultsBar}>
          <p aria-live="polite">
            {isLoading
              ? "Updating products..."
              : `${meta.total} ${meta.total === 1 ? "product" : "products"}`}
            {searchQuery ? ` for "${searchQuery}"` : ""}
          </p>
          {categoryId && (
            <span className={styles.activeCategory}>
              {categories.find((category) => category.id === categoryId)
                ?.name ?? "Selected category"}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className={styles.productGrid} aria-label="Loading products">
            {Array.from({ length: 8 }, (_, index) => (
              <div className={styles.skeleton} key={index} />
            ))}
          </div>
        ) : error ? (
          <div className={styles.messageState} role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() =>
                void getProducts({
                  category: categoryId || undefined,
                  isActive: true,
                  limit: PAGE_SIZE,
                  page: currentPage,
                  search: searchQuery || undefined,
                })
              }
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className={styles.messageState}>
            <h2>No products found</h2>
            <p>Try another search or clear the selected filters.</p>
            {hasFilters && (
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.productGrid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {meta.totalPages > 1 && (
              <nav className={styles.pagination} aria-label="Product pages">
                <button
                  type="button"
                  onClick={() => updateQuery({ page: String(currentPage - 1) })}
                  disabled={currentPage <= 1}
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  Previous
                </button>
                <span aria-current="page">
                  Page {currentPage} of {meta.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuery({ page: String(currentPage + 1) })}
                  disabled={currentPage >= meta.totalPages}
                >
                  Next
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}
