"use client";
//import { styles } from "next/dist/client/components/styles/access-error-styles";
import React from "react";
import styles from "./breadrumbs.module.scss";
import Link from "next/link";
const Breadcrumbs = () => {
  return (
    <div className={styles.breadrumbs}>
      <div className={styles.container}>
        <nav className={styles.nav} aria-label="Breadrumb">
          <Link className={styles.link} href="/category"></Link>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumbs;
