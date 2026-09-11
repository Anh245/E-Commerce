import CartClient from "@/components/modules/cart/CartClient";
import Footer from "@/components/modules/landing/Footer";
import Header from "@/components/modules/landing/Header";
import React from "react";

// Nextjs ISR caching strategy
export const revalidate = false;

export default function page() {
  return (
    <>
      <Header />
      <CartClient />
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
