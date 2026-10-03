import { Suspense } from "react";
import Footer from "@/components/modules/landing/Footer";
import Header from "@/components/modules/landing/Header";
import CatalogClient, {
  CatalogLoading,
} from "@/components/modules/catalog/CatalogClient";

export default function ProductsPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<CatalogLoading />}>
        <CatalogClient />
      </Suspense>
      <Footer />
    </>
  );
}

export function generateMetadata() {
  return {
    title: "Product Catalog | Storefront",
    description: "Browse and search the Storefront product collection.",
  };
}
