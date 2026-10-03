"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/modules/landing/Header";
import Footer from "@/components/modules/landing/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { OrderService } from "@/services/api/order.service";
import { ShoppingBag, Eye } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.scss";

const STATUS_CLASS: Record<string, string> = {
  PENDING: "badge-pending", SHIPPED: "badge-shipped",
  DELIVERED: "badge-delivered", CANCELLED: "badge-cancelled",
};

const TABS = ["All", "PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/auth/login"); return; }
    const fetch = async () => {
      setIsLoading(true);
      try {
        const params: any = { page, limit };
        if (activeTab !== "All") params.status = activeTab;
        const res = await OrderService.getMyOrders(params);
        setOrders(res?.data ?? []);
        setTotal(res?.total ?? 0);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetch();
  }, [isAuthenticated, activeTab, page, router]);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <div className={styles.iconWrap}><ShoppingBag size={24} /></div>
            <div>
              <h1 className={styles.title}>My Orders</h1>
              <p className={styles.subtitle}>{total} orders total</p>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                onClick={() => { setActiveTab(tab); setPage(1); }}
              >{tab}</button>
            ))}
          </div>

          {isLoading ? (
            <div className={styles.loadingList}>
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className={styles.skItem} />)}
            </div>
          ) : orders.length === 0 ? (
            <div className={styles.empty}>
              <ShoppingBag size={40} strokeWidth={1} />
              <p>No orders found.</p>
              <Link href="/products" className={styles.shopBtn}>Browse Products</Link>
            </div>
          ) : (
            <div className={styles.orderList}>
              {orders.map((o) => (
                <div key={o.id} className={styles.orderCard}>
                  <div className={styles.orderTop}>
                    <div>
                      <p className={styles.orderId}>Order #{o.id?.slice(0, 8)}</p>
                      <p className={styles.orderDate}>{new Date(o.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                    <div className={styles.orderRight}>
                      <span className={`admin-badge ${STATUS_CLASS[o.status] ?? ""}`}>{o.status}</span>
                      <span className={styles.amount}>${Number(o.totalAmount ?? 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className={styles.orderBottom}>
                    <p className={styles.address}>{o.shippingAddress || "No address"}</p>
                    <Link href={`/orders/${o.id}`} className={styles.viewBtn}>
                      <Eye size={14} /> View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {Math.ceil(total / limit) > 1 && (
            <div className={styles.pagination}>
              <button className={styles.pgBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
              <span>Page {page} of {Math.ceil(total / limit)}</span>
              <button className={styles.pgBtn} onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))} disabled={page >= Math.ceil(total / limit)}>Next →</button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}