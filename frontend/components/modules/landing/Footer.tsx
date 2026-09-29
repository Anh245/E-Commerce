"use client";

import React from "react";
import styles from "./footer.module.scss";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Brand */}
          <div className={styles.brand}>
            <h3>STOREFRONT</h3>
            <span className={styles.tagline} />
            <p>
              Điểm đến hàng đầu cho các sản phẩm chất lượng. Chúng tôi tuyển chọn kỹ lưỡng những sản phẩm ưu việt nhất để đáp ứng mọi nhu cầu của bạn.
            </p>
          </div>

          {/* Shop */}
          <div className={styles.section}>
            <h4>Shop</h4>
            <ul>
              <li><Link href="/">All products</Link></li>
              <li><Link href="/">Categories</Link></li>
              <li><Link href="/">New arrivals</Link></li>
              <li><Link href="/">Deals</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className={styles.section}>
            <h4>Support</h4>
            <ul>
              <li><Link href="/">Help Center</Link></li>
              <li><Link href="/">Contact Us</Link></li>
              <li><Link href="/">Shipping info</Link></li>
              <li><Link href="/">Returns</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className={styles.section}>
            <h4>Company</h4>
            <ul>
              <li><Link href="/">About us</Link></li>
              <li><Link href="/">Privacy Policy</Link></li>
              <li><Link href="/">Terms of Service</Link></li>
              <li><Link href="/">Careers</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} Storefront. All rights reserved.</p>
          <div className={styles.legal}>
            <Link href="/">Privacy</Link>
            <Link href="/">Terms</Link>
            <Link href="/">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
