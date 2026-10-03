"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CartItemType } from "@/types/cart.type";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "react-toastify";
import styles from "./cart-item.module.scss";

const CartItem = ({ item }: { item: CartItemType }) => {
  const {
    decrementProductQuantity,
    incrementProductQuantity,
    removeProductFromCart,
  } = useCart();
  const { product, quantity } = item;
  const itemTotal = product.price * quantity;

  const handleDecrement = async () => {
    await decrementProductQuantity(product.id);
  };

  const handleIncrement = async () => {
    if (quantity < product.stock) {
      await incrementProductQuantity(product.id);
    } else {
      toast.error(`Only ${product.stock} items available in stock`);
    }
  };

  const handleRemove = async () => {
    if (window.confirm(`Remove "${product.name}" from your cart?`)) {
      await removeProductFromCart(product.id);
    }
  };

  return (
    <div className={styles.cartItem}>
      {/* Product Image */}
      <Link className={styles.imageWrapper} href={`/${product.id}`}>
        <Image
          src={
            product.imageUrl?.trim() ||
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"
          }
          alt={product.name}
          width={110}
          height={110}
          className={styles.image}
        />
      </Link>

      {/* Item Details */}
      <div className={styles.details}>
        <div className={styles.info}>
          <span className={styles.category}>{product.category || "General"}</span>
          <Link className={styles.name} href={`/${product.id}`}>
            {product.name}
          </Link>
          <div className={styles.priceRow}>
            <span className={styles.unitPrice}>${Number(product.price).toFixed(2)}</span>
            {product.stock <= 5 && (
              <span className={styles.lowStockBadge}>
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>

        {/* Quantity and Actions */}
        <div className={styles.actions}>
          <div className={styles.quantityControl}>
            <button
              className={styles.quantityButton}
              onClick={handleDecrement}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              type="button"
            >
              <Minus size={14} />
            </button>
            <span className={styles.quantityValue}>{quantity}</span>
            <button
              className={styles.quantityButton}
              onClick={handleIncrement}
              disabled={quantity >= product.stock}
              aria-label="Increase quantity"
              type="button"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className={styles.totalBlock}>
            <span className={styles.totalLabel}>Total:</span>
            <span className={styles.itemTotal}>${itemTotal.toFixed(2)}</span>
          </div>

          <button
            className={styles.removeButton}
            onClick={handleRemove}
            aria-label="Remove item"
            title="Remove item"
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
