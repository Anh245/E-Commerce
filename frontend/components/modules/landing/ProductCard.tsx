"use client";
import { Product } from "@/types/product.types";
import Link from "next/link";
import React from "react";
import styles from "./product-card.module.scss";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

const ProductCard = ({ product }: { product: Product }) => {
  const id = product.id;
  const isInStock = product.stock > 0;
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link href={`/${id}`} className={styles.card}>
      {/* Image */}
      <div className={styles.imageWrapper}>
        <Image
          src={
            product.imageUrl?.trim() ||
            "https://images.unsplash.com/photo-1677668802628-63089ed265e8?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
          style={{ objectFit: "cover" }}
          loading="lazy"
        />
        <button
          className={`${styles.wishlistBtn} ${isLiked ? styles.activeWishlist : ""}`}
          onClick={handleWishlistClick}
          title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          type="button"
        >
          <Heart size={16} fill={isLiked ? "#ef4444" : "none"} stroke={isLiked ? "#ef4444" : "#475569"} />
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.footer}>
          <span className={styles.prices}>{product.price.toFixed(2)}</span>
          <span
            className={`${styles.stock} ${!isInStock ? styles.outOfStock : ""}`}
          >
            {isInStock ? `${product.stock} in stock` : "Out of Stock"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
