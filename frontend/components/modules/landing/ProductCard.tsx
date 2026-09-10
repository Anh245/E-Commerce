import { Product } from "@/types/product.types";

import Link from "next/link";
import React from "react";
import styles from "./product-card.module.scss";
import Image from "next/image";
const ProductCard = ({ product }: { product: Product }) => {
  const id = product.id;
  const isInStock = product.stock > 0;

  return (
    <Link href={`/${id}`} className={styles.card}>
      <div className={styles.imageWrapper}></div>

      {/* Content */}
      <div className={styles.content}>
        <Image
          src={
            product.imageUrl.trimEnd() ??
            "https://images.unsplash.com/photo-1677668802628-63089ed265e8?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          alt={product.name}
          width={400}
          height={400}
          loading="lazy"
        />
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.footer}>
          <span className={styles.prices}>{product.price.toFixed(2)}</span>
          <span
            className={`${styles.stock} ${!isInStock ? styles.outOfStock : ""}`}
          >
            {isInStock ? product.stock + "In stock" : " Out of Stock"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
