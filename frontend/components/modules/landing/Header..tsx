"use client";
import React from "react";
import styles from "./header.module.scss";
import Link from "next/dist/client/link";
import { LayoutDashboard, ShoppingCart } from "lucide-react";
const Header = () => {
  const isAuthenticated = true; // Replace with your authentication logic
  const totalItems = 4; // Replace with your logic to get the total items in the cart

  const handleDashboardClick = () => {
    console.log("Dashboard clicked");
  };

  const handleLogoutClick = () => {
    console.log("Logout clicked");
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
              >
                Logout
              </button>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
