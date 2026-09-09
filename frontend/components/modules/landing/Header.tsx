"use client";
import React from "react";
import styles from "./header.module.scss";
import Link from "next/dist/client/link";
import { LayoutDashboard, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
const Header = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth(); // Replace with your authentication logic
  const { totalItems } = useCart(); // Replace with your logic to get the total items in the cart
  const router = useRouter();
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
    <header className={styles.header}>
      {/* container */}
      <div className={styles.container}>
        {/* logo */}
        <Link href="/" className={styles.logo}>
          STOREFRONT
        </Link>
        {/* Icon */}
        <div className={styles.actions}>
          <Link href="/cart" className={styles.cartButton}>
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className={styles.badge}>{totalItems}</span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              <LayoutDashboard onClick={handleDashboardClick} />
              <button
                onClick={handleLogoutClick}
                className={styles.logoutButton}
                disabled={isLoading}
              >
                {isLoading ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              {/* <LayoutDashboard onClick={handleDashboardClick} /> */}
              <button
                onClick={handleLoginClick}
                className={styles.logoutButton}
                disabled={isLoading}
              >
                {isLoading ? "is loading..." : "Login"}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
