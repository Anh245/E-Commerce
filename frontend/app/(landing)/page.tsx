import Footer from "@/components/modules/landing/Footer";
import Header from "@/components/modules/landing/Header";
import Hero from "@/components/modules/landing/Hero";
import TrustFeatures from "@/components/modules/landing/TrustFeatures";
import FeaturedCategories from "@/components/modules/landing/FeaturedCategories";
import TrendBanner from "@/components/modules/landing/TrendBanner";
import ProductList from "@/components/modules/landing/ProductList";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Large 2026 Hero Showcase */}
        <Hero />

        {/* 4 Trust & Service Pillars */}
        <TrustFeatures />

        {/* Visual Category Grid */}
        <FeaturedCategories />

        {/* Exclusive Trend Spotlight & Coupon */}
        <TrendBanner />

        {/* Full Filterable Product Catalog */}
        <ProductList />
      </main>
      <Footer />
    </>
  );
}
