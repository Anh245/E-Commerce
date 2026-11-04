import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        ? [{ protocol: "https" as const, hostname: "res.cloudinary.com", port: "", pathname: `/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/**`, search: "" }]
        : []),
      // Optional origin for existing images uploaded before the Cloudinary migration.
      ...(process.env.PRODUCT_IMAGES_BASE_URL
        ? [new URL(`${process.env.PRODUCT_IMAGES_BASE_URL.replace(/\/$/, "")}/products/**`)]
        : []),
    ],
  },
};

export default nextConfig;
