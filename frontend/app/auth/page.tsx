import LoginForm from "@/components/modules/auth/LoginForm";
import React from "react";

export const revalidate = false;

export default function LoginPage() {
  return <LoginForm />;
}

export function generateMetadata() {
  return {
    title: "Đăng nhập - STOREFRONT",
    description: "Đăng nhập vào tài khoản STOREFRONT của bạn.",
    icons: {
      icon: `/favicon.ico`,
    },
  };
}

