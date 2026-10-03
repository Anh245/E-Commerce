"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useCategory } from "@/hooks/useCategory";
import { ArrowRight, Sparkles } from "lucide-react";
import styles from "./featured-categories.module.scss";

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  Fashion: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80",
  Electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
  "Home Decor": "https://images.unsplash.com/photo-1616486338812-3dADAe4b4ace?w=600&auto=format&fit=crop&q=80",
  Beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
  Jewelry: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80",
};

export default function FeaturedCategories() {
  const { categories, getCategories, isLoading } = useCategory();

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <div className={styles.badge}>
              <Sparkles size={14} /> Curated Collections
            </div>
            <h2 className={styles.title}>Shop by Category</h2>
            <p className={styles.subtitle}>
              Explore our hand-selected categories designed for modern living.
            </p>
          </div>
          <Link href="/products" className={styles.viewAll}>
            Browse all categories <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.grid}>
          {isLoading && categories.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))
          ) : categories.length === 0 ? (
            <div className={styles.empty}>No categories available.</div>
          ) : (
            categories.slice(0, 6).map((cat) => {
              const bgImg =
                cat.imageUrl ||
                DEFAULT_CATEGORY_IMAGES[cat.name] ||
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";

              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.id)}`}
                  className={styles.card}
                >
                  <div
                    className={styles.cardBg}
                    style={{ backgroundImage: `url(${bgImg})` }}
                  />
                  <div className={styles.overlay} />
                  <div className={styles.content}>
                    <span className={styles.tag}>Collection</span>
                    <h3 className={styles.catName}>{cat.name}</h3>
                    <p className={styles.description}>
                      {cat.description || "Discover the trending items in this category"}
                    </p>
                    <span className={styles.exploreLink}>
                      Explore <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
