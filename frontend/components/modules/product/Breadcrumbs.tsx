"use client";
//import { styles } from "next/dist/client/components/styles/access-error-styles";
import React from "react";
import styles from "./breadrumbs.module.scss";
import Link from "next/link";
const Breadcrumbs = ({ productName }: { productName: string }) => {
  return (
    <div className={styles.breadrumbs}>
      <div className={styles.container}>
        <nav className={styles.nav} aria-label="Breadrumb">
          <Link className={styles.link} href="/">
            Store
          </Link>
          <span className={styles.separator}>/</span>
          <span className={styles.current}> {productName}</span>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumbs;
