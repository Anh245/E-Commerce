"use client";
import React from "react";
import styles from "./cart.module.scss";
import { getTraceItems } from "next/dist/next-devtools/dev-overlay/components/request-insights/trace-viewer";
import { useCart } from "@/hooks/useCart";
import CartItem from "./CartItem";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

import { useRouter } from "next/navigation";
const CartClient = () => {
  const router = useRouter();
  const { items, clearAllCart, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/cart");
    } else {
      router.push("/checkout");
    }
  };
  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      await clearAllCart();
    }
  };
  if (items.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.empty}>
            <ShoppingCart className={styles.emptyIcon} size={64} />
            <h2>Your cart is empty</h2>
            <p>Add some product to get started</p>
            <Link href="/" className={styles.continueButton}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }
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
          <div className={styles.itemsList}>
            {items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>

          {/* sumary */}
          <div className={styles.sumary}>
            <h2>Order summary</h2>
            <div className={styles.sumaryRow}>
              <span>Subtotal</span>
              <span>${totalPrice}</span>
            </div>

            <div className={styles.sumaryRow}>
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.sumaryTotal}>
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          <button className={styles.checkoutButton} onClick={handleCheckout}>
            Proceed to checkout
          </button>
          <Link className={styles.continueLink} href="/">
            Continue Shipping
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CartClient;
