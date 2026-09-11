"use client";
import React from "react";
import styles from "./cart.module.scss";
import { getTraceItems } from "next/dist/next-devtools/dev-overlay/components/request-insights/trace-viewer";
import { useCart } from "@/hooks/useCart";
import CartItem from "./CartItem";
const CartClient = () => {
  const { items } = useCart();
  const handleClearCart = () => {};

  return (
    <section className={styles.section}>
      {/* container */}
      <div className={styles.container}>
        {/* header */}

        <div className={styles.header}>
          <h1>Shopping Cart</h1>
          <button onClick={handleClearCart} className={styles.clear}>
            Clear cart
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.itemList}>
            {items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartClient;
