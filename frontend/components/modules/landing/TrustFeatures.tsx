"use client";
import React from "react";
import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import styles from "./trust-features.module.scss";

const FEATURES = [
  {
    icon: Truck,
    title: "Free Express Shipping",
    desc: "On all orders over $150. Fast, tracked worldwide delivery.",
    color: "#6366f1",
    bgColor: "#eef2ff",
  },
  {
    icon: ShieldCheck,
    title: "100% Secure Checkout",
    desc: "Encrypted payments via Stripe, Apple Pay, & major cards.",
    color: "#10b981",
    bgColor: "#ecfdf5",
  },
  {
    icon: RotateCcw,
    title: "30 Days Easy Return",
    desc: "Not satisfied? Return or exchange with zero hassle.",
    color: "#f59e0b",
    bgColor: "#fffbeb",
  },
  {
    icon: Headphones,
    title: "24/7 Priority Support",
    desc: "Dedicated personal customer care anytime, anywhere.",
    color: "#ec4899",
    bgColor: "#fdf2f8",
  },
];

export default function TrustFeatures() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={styles.item}>
                <div
                  className={styles.iconCircle}
                  style={{ background: item.bgColor, color: item.color }}
                >
                  <Icon size={24} strokeWidth={1.8} />
                </div>
                <div className={styles.textGroup}>
                  <h4 className={styles.title}>{item.title}</h4>
                  <p className={styles.desc}>{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
