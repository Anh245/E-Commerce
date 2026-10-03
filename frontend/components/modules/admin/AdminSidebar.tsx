"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Tag, ShoppingBag,
  Users, CreditCard, Settings, LogOut,
  ChevronLeft, ChevronRight, Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import styles from "./AdminSidebar.module.scss";

const NAV_ITEMS = [
  { href: "/admin",            label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/products",   label: "Products",   icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders",     label: "Orders",     icon: ShoppingBag },
  { href: "/admin/users",      label: "Users",      icon: Users },
  { href: "/admin/payments",   label: "Payments",   icon: CreditCard },
  { href: "/admin/settings",   label: "Settings",   icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const fullName = user?.firstName
    ? (user.firstName + " " + (user.lastName ?? "")).trim()
    : user?.email ?? "";

  return (
    <aside className={styles.sidebar + (collapsed ? " " + styles.collapsed : "")}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}><Sparkles size={18} /></div>
        {!collapsed && <span className={styles.logoText}>LUXE Admin</span>}
      </div>

      {!collapsed && (
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className={styles.userMeta}>
            <p className={styles.userName}>{fullName}</p>
            <p className={styles.userRole}>Super Admin</p>
          </div>
        </div>
      )}

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={styles.navItem + (isActive(href) ? " " + styles.active : "")}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} strokeWidth={1.75} />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        {!collapsed && <span>Collapse</span>}
      </button>

      <button className={styles.logout} onClick={handleLogout}>
        <LogOut size={18} strokeWidth={1.75} />
        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  );
}
