import Footer from "@/components/modules/landing/Footer";
import Header from "@/components/modules/landing/Header";
import ProductDetailClient from "@/components/modules/product/ProductDetailClient";
import Head from "next/head";
import React from "react";

// Nextjs ISR caching strategy
export const revalidate = false;

export default function Page() {
  return (
    <>
      <Header />
      <ProductDetailClient />
      <Footer />
    </>
  );
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: `Page - Title here`,
    description: `Page - Description here`,
    icons: {
      icon: `path to asset file`,
    },
  };
}
