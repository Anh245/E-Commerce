"use client";
import React, { useEffect } from "react";
import styles from "./header.module.scss";
import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Search } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useCategory } from "@/hooks/useCategory";

const Header = () => {
  const { getCategories, categories } = useCategory();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();

  //Use Effect
  useEffect(() => {
    getCategories();
  }, []);

  const handleDashboardClick = () => {
    if (user && user.role == "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/user");
    }
  };

  const handleLogoutClick = async () => {
    await logout();
  };

  const handleLoginClick = () => {
    router.push("/auth/login");
  };

  return (
    <header>
      {/* Main bar: logo + search + actions */}
      <div className={styles.header}>
        <div className={styles.mainBar}>
          {/* Logo wordmark */}
          <Link href="/" className={styles.logo}>
            STOREFRONT
          </Link>

          {/* Pill search bar (center) */}
          <div className={styles.searchWrapper}>
            <Search size={15} className={styles.searchIcon} strokeWidth={1.5} />
            <input type="text" placeholder="Search products…" />
          </div>

          {/* Right actions */}
          <div className={styles.actions}>
            <Link href="/cart" className={styles.cartButton}>
              <ShoppingCart size={18} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className={styles.badge}>{totalItems}</span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <button
                  className={styles.dashboardButton}
                  onClick={handleDashboardClick}
                  title="Dashboard"
                >
                  <LayoutDashboard size={18} strokeWidth={1.5} />
                </button>
                <button
                  onClick={handleLogoutClick}
                  className={styles.ctaButton}
                  disabled={isLoading}
                >
                  {isLoading ? "Logging out…" : "Logout"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLoginClick}
                  className={styles.ghostButton}
                  disabled={isLoading}
                >
                  Sign in
                </button>
                <button
                  onClick={handleLoginClick}
                  className={styles.ctaButton}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading…" : "Sign up to buy"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Category nav bar below main header */}
      <nav className={styles.categoryNav}>
        <div className={styles.navInner}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href="/"
              className={`${styles.navLink} ${cat.name === "All" ? styles.active : ""}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
