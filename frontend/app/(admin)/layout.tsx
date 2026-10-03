"use client";
import AdminSidebar from "@/components/modules/admin/AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }
    if (user && user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user && user.role !== "ADMIN")) {
    return null;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
