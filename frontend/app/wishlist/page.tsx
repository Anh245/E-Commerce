"use client";
import React from "react";
import Header from "@/components/modules/landing/Header";
import Footer from "@/components/modules/landing/Footer";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.scss";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addProductToCart } = useCart();

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <Link href="/products" className={styles.backLink}>
                <ArrowLeft size={16} /> Back to Shopping
              </Link>
              <h1 className={styles.title}>My Wishlist</h1>
              <p className={styles.subtitle}>
                {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved for later
              </p>
            </div>
            {wishlistItems.length > 0 && (
              <button onClick={clearWishlist} className={styles.clearBtn}>
                Clear All
              </button>
            )}
          </div>

          {wishlistItems.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.iconCircle}>
                <Heart size={36} strokeWidth={1.5} />
              </div>
              <h2>Your wishlist is empty</h2>
              <p>Explore our products and tap the heart icon on any item you love!</p>
              <Link href="/products" className={styles.exploreBtn}>
                Explore Products
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {wishlistItems.map((product) => (
                <div key={product.id} className={styles.card}>
                  <div className={styles.imgWrapper}>
                    <img
                      src={
                        product.imageUrl?.trim() ||
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"
                      }
                      alt={product.name}
                      className={styles.image}
                    />
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className={styles.removeBtn}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className={styles.cardBody}>
                    <Link href={`/${product.id}`} className={styles.productName}>
                      {product.name}
                    </Link>
                    <p className={styles.price}>${Number(product.price).toFixed(2)}</p>
                    <button
                      onClick={() => {
                        addProductToCart(product);
                      }}
                      className={styles.addCartBtn}
                    >
                      <ShoppingBag size={16} /> Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
