import Footer from "@/components/modules/landing/Footer";
import Header from "@/components/modules/landing/Header";
import Hero from "@/components/modules/landing/Hero";
import ProductList from "@/components/modules/landing/ProductList";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductList />
      </main>
      <Footer />
    </>
  );
}
