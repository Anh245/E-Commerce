"use client";
import React, { useEffect, useState } from "react";
import styles from "./header.module.scss";
import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Search, Heart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useCategory } from "@/hooks/useCategory";

const Header = () => {
  const { getCategories, categories } = useCategory();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const router = useRouter();
  const [search, setSearch] = useState("");

  //Use Effect
  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const handleDashboardClick = () => {
    if (user && user.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/profile");
    }
  };

  const handleLogoutClick = async () => {
    await logout();
  };

  const handleLoginClick = () => {
    router.push("/auth/login");
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    router.push(
      query ? `/products?search=${encodeURIComponent(query)}` : "/products",
    );
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
          <form
            className={styles.searchWrapper}
            onSubmit={handleSearchSubmit}
            role="search"
          >
            <Search size={15} className={styles.searchIcon} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search products…"
              aria-label="Search products"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </form>

          {/* Right actions */}
          <div className={styles.actions}>
            <Link href="/wishlist" className={styles.cartButton} title="Wishlist">
              <Heart size={18} strokeWidth={1.5} />
              {totalWishlistItems > 0 && (
                <span className={styles.badge}>{totalWishlistItems}</span>
              )}
            </Link>

            <Link href="/cart" className={styles.cartButton} title="Cart">
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
          <Link href="/products" className={styles.navLink}>
            All products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${encodeURIComponent(cat.id)}`}
              className={styles.navLink}
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
