"use client";

import React from "react";
import styles from "./footer.module.scss";
import Link from "next/link";
const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <h3>STOREFRONT</h3>
            <p>
              The first destianation for quality products. we create the finest
              selection to meet your needs
            </p>
          </div>

          <div className={styles.section}>
            <h4>SHOP</h4>
            <ul>
              <li>
                <Link href="/">All products</Link>
              </li>

              <li>
                <Link href="/">Categories</Link>
              </li>

              <li>
                <Link href="/">New arrivals</Link>
              </li>

              <li>
                <Link href="/">Deals</Link>
              </li>
            </ul>
          </div>
          {/* SUpport footer */}
          <div className={styles.section}>
            <h4>SUPPORT</h4>
            <ul>
              <li>
                <Link href="/">Help Center</Link>
              </li>

              <li>
                <Link href="/">Contact Us</Link>
              </li>

              <li>
                <Link href="/">Shopping info</Link>
              </li>

              <li>
                <Link href="/">Returns</Link>
              </li>
            </ul>
          </div>

          {/* COMPANY */}

          <div className={styles.section}>
            <h4>COMPANY</h4>
            <ul>
              <li>
                <Link href="/">About us</Link>
              </li>

              <li>
                <Link href="/">Privacy Policy</Link>
              </li>

              <li>
                <Link href="/">Term of Service</Link>
              </li>

              <li>
                <Link href="/">Carrers</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
