"use client";

import Link from "next/link";
import styles from "./cart-item.module.scss";

import React from "react";
import ProductCard from "../landing/ProductCard";
import { CartItemType } from "@/types/cart.type";
import Image from "next/image";
import { instrumentParamsForClientValidation } from "next/dist/client/components/instant-samples";
import { Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";

const CartItem = ({ item }: { item: CartItemType }) => {
  const { decrementProductQuantity } = useCart();
  const { product, quantity } = item;
  const itemTotal = product.price * quantity;

  const handleDecrement = async () => {
    await decrementProductQuantity(product.id);
  };
  const handleIncrement = () => {};
  const handleRemove = () => {};

  return (
    <div className={styles.cartItem}>
      <Link className={styles.imageWrapper} href={product.id}>
        <Image
          src={
            product.imageUrl.trimEnd() ??
            "https://images.unsplash.com/photo-1677668802628-63089ed265e8?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          alt={product.name}
          width={120}
          height={120}
        />
      </Link>

      <div className={styles.detail}>
        <div className={styles.info}>
          <Link className={styles.name} href={`/${product.id}`}>
            {product.name}
          </Link>
          <span className={styles.category}>{product.categoryId}</span>
          <span className={styles.price}>{product.price.toFixed(2)}</span>
          {product.stock <= 5 && (
            <span className={styles.lowStock}>
              Only {product.stock} left in stock
            </span>
          )}
        </div>

        <div className={styles.action}>
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

          <div className={styles.itemTotal}>{itemTotal.toFixed(2)}</div>

          <button
            className={styles.removeButton}
            onClick={handleRemove}
            aria-label="Remove item"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
