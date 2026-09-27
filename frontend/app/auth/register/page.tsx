import RegisterForm from "@/components/modules/auth/RegisterForm";
import React from "react";

export const revalidate = false;

export default function RegisterPage() {
  return <RegisterForm />;
}

export function generateMetadata() {
  return {
    title: "Đăng ký - STOREFRONT",
    description: "Tạo tài khoản mới để mua sắm dễ dàng hơn tại STOREFRONT.",
    icons: {
      icon: `/favicon.ico`,
    },
  };
}
