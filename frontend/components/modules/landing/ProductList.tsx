//import { styles } from "next/dist/client/components/styles/access-error-styles";
"use client";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./product-list.module.scss";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "./ProductCard";

const ProductList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { isLoading, products, getProducts, error, meta } = useProducts();
  const limit = 12;
  useEffect(() => {
    getProducts({ page, limit, search: debouncedSearch });
  });

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
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Sản phẩm của chúng tôi</h2>
          <p>Khám phá bộ sưu tập các sản phẩm cao cấp do chúng tôi tạo ra.</p>
        </div>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        {isLoading ? (
          <div className={styles.loading}>Loading products....</div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            {debouncedSearch
              ? `Khong tim thay san pham  ${debouncedSearch}`
              : "No available"}
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductList;
