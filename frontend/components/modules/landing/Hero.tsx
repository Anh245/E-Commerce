"use client";
import React from "react";
import Link from "next/link";
import styles from "./hero.module.scss";

const Hero = () => {
  return (
    <section className={styles.hero}>
      {/* Full-bleed background image */}
      <div className={styles.imageLayer}>
        <img
          src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1920&auto=format&fit=crop"
          alt="Boutique storefront with curated products"
          className={styles.heroImage}
        />
        <div className={styles.overlay} />
      </div>

      {/* Editorial headline — bottom-left  */}
      <div className={styles.content}>
        <div className={styles.headlineGroup}>
          <p className={styles.eyebrow}>New arrivals · Curated collection</p>
          <h1 className={styles.headline}>
            Shop the finest
            <br />
            <em>wholesale catalog</em>
          </h1>
          <div className={styles.accentRule} />
          <p className={styles.subtext}>
            Over 100,000 brands. Curated for quality, delivered to your door.
          </p>
          <div className={styles.actions}>
            <Link href="/" className={styles.ctaPrimary}>
              Shop now
            </Link>
            <Link href="/auth/login" className={styles.ctaGhost}>
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Promo strip at top */}
      <div className={styles.promoBanner}>
        <p>
          Shop wholesale online from over{" "}
          <strong>100,000 brands.</strong>{" "}
          <Link href="/auth/login" className={styles.promoLink}>
            Sign up free →
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Hero;
