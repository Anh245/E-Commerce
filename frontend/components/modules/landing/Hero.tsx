"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Star, ShieldCheck, Zap } from "lucide-react";
import styles from "./hero.module.scss";

const Hero = () => {
  return (
    <section className={styles.hero}>
      {/* Dynamic Background */}
      <div className={styles.bgGlow} />

      <div className={styles.container}>
        <div className={styles.content}>
          {/* 2026 Capsule Badge */}
          <div className={styles.pillBadge}>
            <Sparkles size={14} className={styles.sparkle} />
            <span>Curated Edition · Spring 2026</span>
          </div>

          {/* Main Headline */}
          <h1 className={styles.headline}>
            Redefining Style with <br />
            <span className={styles.gradientText}>Minimalist Luxury</span>
          </h1>

          <p className={styles.subtext}>
            Discover handpicked designer pieces crafted with uncompromising quality.
            Seamless shopping, transparent pricing, and doorstep delivery worldwide.
          </p>

          {/* Action CTAs */}
          <div className={styles.actions}>
            <Link href="/products" className={styles.ctaPrimary}>
              Explore Collection <ArrowRight size={17} />
            </Link>
            <Link href="/products?category=trending" className={styles.ctaGhost}>
              Trending Drops
            </Link>
          </div>

          {/* Social Proof */}
          <div className={styles.socialProof}>
            <div className={styles.avatarGroup}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Customer"
                className={styles.avatar}
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Customer"
                className={styles.avatar}
              />
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                alt="Customer"
                className={styles.avatar}
              />
            </div>
            <div className={styles.proofText}>
              <div className={styles.stars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="#f59e0b" stroke="#f59e0b" />
                ))}
              </div>
              <p>Loved by <strong>50,000+</strong> shoppers globally</p>
            </div>
          </div>
        </div>

        {/* Hero Visual / Glass Card Showcase */}
        <div className={styles.visual}>
          <div className={styles.mainCard}>
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80"
              alt="Luxury minimal fashion"
              className={styles.heroImg}
            />
            {/* Floating Glass Pill 1 */}
            <div className={`${styles.glassBadge} ${styles.badgeTop}`}>
              <Zap size={16} className={styles.badgeIcon} />
              <div>
                <strong>Flash Drop 2026</strong>
                <small>Limited stock available</small>
              </div>
            </div>

            {/* Floating Glass Pill 2 */}
            <div className={`${styles.glassBadge} ${styles.badgeBottom}`}>
              <ShieldCheck size={16} className={styles.badgeIconGreen} />
              <div>
                <strong>100% Authentic</strong>
                <small>Verified Craftsmanship</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
