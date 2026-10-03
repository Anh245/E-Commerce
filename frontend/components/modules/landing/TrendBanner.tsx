"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Compass } from "lucide-react";
import styles from "./trend-banner.module.scss";

export default function TrendBanner() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.banner}>
          {/* Glass background gradient */}
          <div className={styles.glow1} />
          <div className={styles.glow2} />

          <div className={styles.inner}>
            <div className={styles.content}>
              <div className={styles.badge}>
                <Sparkles size={14} /> Seasonal Spotlight · 2026
              </div>
              <h2 className={styles.title}>
                Elevate Your Lifestyle with <br />
                <em>Minimalist Elegance</em>
              </h2>
              <p className={styles.desc}>
                Discover our handpicked curation of contemporary essentials.
                Crafted with precision, designed for timeless appeal, and delivered with care worldwide.
              </p>

              <div className={styles.actionGroup}>
                <Link href="/products" className={styles.shopBtn}>
                  Shop Trending Now <ArrowRight size={16} />
                </Link>
                <Link href="/products" className={styles.secondaryBtn}>
                  <Compass size={16} /> Explore All Products
                </Link>
              </div>
            </div>

            <div className={styles.visual}>
              <div className={styles.glassCard}>
                <div className={styles.imageOverlay} />
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80"
                  alt="Minimalist design aesthetic"
                  className={styles.bannerImg}
                />
                <div className={styles.floatingBadge}>
                  <strong>NEW ARRIVALS</strong>
                  <span>Spring · 2026 Collection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
