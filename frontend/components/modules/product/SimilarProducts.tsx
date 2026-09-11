"use client";
//import { styles } from "next/dist/client/components/styles/access-error-styles";
import React, { useEffect } from "react";
import styles from "./similar-products.module.scss";
import ProductCard from "../landing/ProductCard";

import { useProducts } from "@/hooks/useProducts";

const SimilarProducts = ({
  category,
  currentProductId,
}: {
  category: string;
  currentProductId: string;
}) => {
  const { products, getProducts } = useProducts();

  //lay thong tin cac san pham tuong tu khi category thay doi
  useEffect(() => {
    if (category) {
      getProducts({ category, limit: 8 });
    }
  }, [category, getProducts]);

  //Lay thong tin cac san pham tuong tu
  const similarProducts = products.filter(
    (product) => product.id !== currentProductId,
  );

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Similar Product</h2>
          <p>You might also like these products </p>
        </div>

        {/* generate product list */}
        <div className={styles.grid}>
          {similarProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SimilarProducts;
