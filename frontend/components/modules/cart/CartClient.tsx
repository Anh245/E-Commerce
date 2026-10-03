"use client";
import React from "react";
import styles from "./cart.module.scss";
import { useCart } from "@/hooks/useCart";
import CartItem from "./CartItem";
import {
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const FREE_SHIPPING_THRESHOLD = 150;

const CartClient = () => {
  const router = useRouter();
  const { items, clearAllCart, totalPrice, totalItems } = useCart();
  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/checkout");
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
            <div className={styles.emptyIconCircle}>
              <ShoppingCart size={42} strokeWidth={1.5} />
            </div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link href="/products" className={styles.continueButton}>
              <ArrowLeft size={16} /> Start Shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const shippingCost = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 15;
  const finalTotal = totalPrice + (totalPrice > 0 ? shippingCost : 0);
  const progressPercent = Math.min(100, Math.round((totalPrice / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Breadcrumb / Back */}
        <div className={styles.topBar}>
          <Link href="/products" className={styles.backLink}>
            <ArrowLeft size={15} /> Continue shopping
          </Link>
          <button onClick={handleClearCart} className={styles.clearButton} type="button">
            <Trash2 size={14} /> Clear all
          </button>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <h1>Shopping Cart</h1>
          <span className={styles.countBadge}>
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Free Shipping Meter */}
        <div className={styles.shippingMeter}>
          <div className={styles.meterText}>
            {remainingForFreeShipping === 0 ? (
              <span className={styles.freeAchieved}>
                🎉 <strong>Congratulations!</strong> You unlocked <strong>Free Express Shipping</strong>!
              </span>
            ) : (
              <span>
                Add <strong>${remainingForFreeShipping.toFixed(2)}</strong> more to get <strong>Free Express Shipping</strong>!
              </span>
            )}
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Content 2-column Grid */}
        <div className={styles.content}>
          {/* Left: Cart Items List */}
          <div className={styles.itemsList}>
            {items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>

          {/* Right: Order Summary Card */}
          <div className={styles.summarySidebar}>
            <div className={styles.summaryCard}>
              <h2>Order Summary</h2>

              {/* Subtotal */}
              <div className={styles.summaryRow}>
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              {/* Shipping */}
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className={styles.freeBadge}>FREE</span>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>

              <hr className={styles.divider} />

              {/* Total */}
              <div className={styles.totalRow}>
                <div className={styles.totalTitle}>
                  <span>Total</span>
                  <small>VAT included</small>
                </div>
                <span className={styles.finalPrice}>${finalTotal.toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <button className={styles.checkoutButton} onClick={handleCheckout}>
                Proceed to Checkout <ArrowRight size={17} />
              </button>

              {/* Trust Badges */}
              <div className={styles.trustBadges}>
                <div className={styles.trustItem}>
                  <ShieldCheck size={16} />
                  <span>Secure 256-bit encryption</span>
                </div>
                <div className={styles.trustItem}>
                  <RotateCcw size={16} />
                  <span>30 days easy return policy</span>
                </div>
                <div className={styles.trustItem}>
                  <Truck size={16} />
                  <span>Fast tracked delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartClient;
