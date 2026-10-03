"use client";
import React from "react";
import { Bell, Search } from "lucide-react";
import styles from "./AdminHeader.module.scss";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const now = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle || now}</p>}
      </div>
      <div className={styles.right}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
          />
        </div>
        <button className={styles.notifBtn} aria-label="Notifications">
          <Bell size={18} />
          <span className={styles.notifDot} />
        </button>
      </div>
    </header>
  );
}
