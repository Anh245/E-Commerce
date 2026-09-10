"use client";

import React, { useEffect } from "react";
import Breadcrumbs from "./Breadcrumbs";
import { useProducts } from "@/hooks/useProducts";

const ProductDetailClient = ({ productId }: { productId: string }) => {
  const { getProduct, product } = useProducts();

  useEffect(() => {
    if (productId) {
      getProduct(productId);
    }
  }, [productId, getProduct]);
  return (
    <>
      <Breadcrumbs productName={product!.name} />
    </>
  );
};

export default ProductDetailClient;
