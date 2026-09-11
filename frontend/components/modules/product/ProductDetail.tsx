"use client";

//import { styles } from "next/dist/client/components/styles/access-error-styles";
import React, { useState } from "react";
import styles from "./product-detail.module.scss";
import Image from "next/image";
import { Product } from "@/types/product.types";
import { useCart } from "@/hooks/useCart";
import { toast } from "react-toastify";
const ProductDetail = ({ product }: { product: Product }) => {
  const isInStock = product.stock > 0;

  const { addProductToCart } = useCart();

  //set quantity
  const [quantity, setQuantity] = useState(1);

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    if (isInStock) {
      addProductToCart({
        ...product,
        quantity,
      });
      setQuantity(1);
      //alert("Added" + quantity + product.name + " to cart");
      toast.success("Added" + quantity + product.name + " to cart");
    }
  };
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.imageWrapper}>
            <Image
              src={product.imageUrl.trimEnd()}
              alt={product.name}
              width={600}
              height={600}
              priority
            />
          </div>

          <div className={styles.info}>
            <span className={styles.category}>{product.category}</span>
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.price}>{product.price.toFixed(2)}</p>
            <span
              className={`${styles.stock} ${!isInStock ? styles.outOfStock : ""}`}
            >
              {isInStock
                ? `${product.name} available in stock `
                : "Out of stock"}
            </span>

            <hr className={styles.divider} />
            <p className={styles.description}> {product.description}</p>
            <hr className={styles.divider} />
            {isInStock && (
              <div className={styles.quantitySection}>
                <label htmlFor="quantity" className={styles.label}>
                  Quantity
                </label>
                <div className={styles.quantityControl}>
                  <button
                    className={styles.quantityButton}
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className={styles.quantityValue}>quantity</span>
                  <button
                    className={styles.quantityButton}
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock}
                    aria-label="Decrease quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              className={styles.addToCartButton}
              onClick={handleAddToCart}
              disabled={!isInStock}
            >
              {isInStock ? "Add a cart" : " Out of stock"}
            </button>

            <p className={styles.sku}> SKU: {product.sku}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
