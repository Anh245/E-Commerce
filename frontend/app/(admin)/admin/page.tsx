"use client";
import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/modules/admin/AdminHeader";
import { TrendingUp, ShoppingBag, Users, Package, ArrowUpRight, ArrowDownRight, Eye } from "lucide-react";
import { OrderService } from "@/services/api/order.service";
import { UserService } from "@/services/api/user.service";
import { ProductService } from "@/services/api/product.Service";
import styles from "./page.module.scss";

const STATUS_CLASS: Record<string, string> = {
  PENDING: "badge-pending", SHIPPED: "badge-shipped",
  DELIVERED: "badge-delivered", CANCELLED: "badge-cancelled",
};

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, usersRes, productsRes] = await Promise.allSettled([
          OrderService.getAllOrdersAdmin({ limit: 8 }),
          UserService.getAllUsers(),
          ProductService.getProducts({ limit: 1 }),
        ]);
        if (ordersRes.status === "fulfilled") {
          const data = ordersRes.value;
          const list: any[] = data.data ?? [];
          setOrders(list.slice(0, 8));
          const rev = list.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
          setStats((p) => ({ ...p, totalOrders: data.total ?? list.length, totalRevenue: rev }));
        }
        if (usersRes.status === "fulfilled") {
          const users = usersRes.value;
          setStats((p) => ({ ...p, totalUsers: Array.isArray(users) ? users.length : 0 }));
        }
        if (productsRes.status === "fulfilled") {
          const meta = productsRes.value?.meta;
          setStats((p) => ({ ...p, totalProducts: meta?.total ?? 0 }));
        }
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const STAT_CARDS = [
    { label: "Total Revenue", value: "$" + stats.totalRevenue.toLocaleString(), change: "+12.5% this month", up: true,  icon: TrendingUp,  iconColor: "#059669", iconBg: "#dcfce7" },
    { label: "Total Orders",  value: String(stats.totalOrders),               change: "+8.3% this month",  up: true,  icon: ShoppingBag, iconColor: "#2563eb", iconBg: "#dbeafe" },
    { label: "Total Users",   value: String(stats.totalUsers),                change: "+15.2% this month", up: true,  icon: Users,       iconColor: "#7c3aed", iconBg: "#ede9fe" },
    { label: "Products",      value: String(stats.totalProducts),             change: "Manage stock",      up: false, icon: Package,     iconColor: "#d97706", iconBg: "#fef3c7" },
  ];

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <>
      <AdminHeader
        title="Dashboard Overview"
        subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      />
      <div className="admin-content">
        <div className={styles.statsGrid}>
          {STAT_CARDS.map((card) => (
            <div key={card.label} className="stat-card">
              <div className={styles.statTop}>
                <span className="stat-label">{card.label}</span>
                <div className={styles.statIconWrap} style={{ background: card.iconBg }}>
                  <card.icon size={18} color={card.iconColor} />
                </div>
              </div>
              <span className="stat-value">
                {isLoading ? <span className={styles.skeleton} style={{ display: "inline-block", width: 80, height: 28, borderRadius: 4 }} /> : card.value}
              </span>
              <span className={"stat-change " + (card.up ? "up" : "warn")}>
                {card.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {card.change}
              </span>
            </div>
          ))}
        </div>

        <div className={"admin-card " + styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.sectionTitle}>Recent Orders</h2>
            <a href="/admin/orders" className="admin-btn-ghost">View all</a>
          </div>
          {isLoading ? (
            <div className={styles.loadingRows}>
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className={styles.skeletonRow} />)}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th><th>User ID</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "var(--admin-text-muted)", padding: "2rem" }}>No orders yet</td>
                    </tr>
                  ) : orders.map((order) => (
                    <tr key={order.id}>
                      <td><span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--admin-text-muted)" }}>{"#" + order.id.slice(0, 8)}</span></td>
                      <td style={{ fontSize: "0.85rem" }}>{(order.userId ?? "").slice(0, 12) + "…"}</td>
                      <td style={{ fontWeight: 600 }}>{"$" + Number(order.totalAmount ?? 0).toFixed(2)}</td>
                      <td><span className={"admin-badge " + (STATUS_CLASS[order.status] ?? "")}>{order.status}</span></td>
                      <td style={{ color: "var(--admin-text-muted)", fontSize: "0.82rem" }}>{fmt(order.createdAt)}</td>
                      <td>
                        <a href={"/admin/orders/" + order.id} className="admin-btn-edit"><Eye size={13} /> View</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
