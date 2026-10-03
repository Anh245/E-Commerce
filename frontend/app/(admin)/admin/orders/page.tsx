"use client";
import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/modules/admin/AdminHeader";
import { Eye, Pencil } from "lucide-react";
import { OrderService } from "@/services/api/order.service";
import styles from "./page.module.scss";

const STATUS_CLASS: Record<string, string> = {
  PENDING: "badge-pending", SHIPPED: "badge-shipped",
  DELIVERED: "badge-delivered", CANCELLED: "badge-cancelled",
};

const TABS = ["All", "PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const params: any = { page, limit };
        if (activeTab !== "All") params.status = activeTab;
        const res = await OrderService.getAllOrdersAdmin(params);
        setOrders(res?.data ?? []);
        setTotal(res?.total ?? 0);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetch();
  }, [activeTab, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <AdminHeader title="Orders Management" subtitle={String(total) + " orders total"} />
      <div className="admin-content">
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className={styles.tabs}>
            {TABS.map((tab) => (
              <button
                key={tab}
                className={styles.tab + (activeTab === tab ? " " + styles.tabActive : "")}
                onClick={() => { setActiveTab(tab); setPage(1); }}
              >{tab}</button>
            ))}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th><th>User ID</th><th>Amount</th>
                  <th>Status</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}><div style={{ height: 16, background: "#f1f5f9", borderRadius: 4 }} /></td>
                  ))}</tr>
                )) : orders.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--admin-text-muted)" }}>No orders</td></tr>
                ) : orders.map((o) => (
                  <tr key={o.id}>
                    <td><code style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)" }}>{"#" + (o.id ?? "").slice(0, 8)}</code></td>
                    <td style={{ fontSize: "0.82rem", color: "var(--admin-text-muted)" }}>{(o.userId ?? "").slice(0, 12) + "…"}</td>
                    <td style={{ fontWeight: 600 }}>{"$" + Number(o.totalAmount ?? 0).toFixed(2)}</td>
                    <td><span className={"admin-badge " + (STATUS_CLASS[o.status] ?? "")}>{o.status}</span></td>
                    <td style={{ fontSize: "0.82rem", color: "var(--admin-text-muted)" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.375rem" }}>
                        <a href={"/admin/orders/" + o.id} className="admin-btn-edit"><Eye size={13} /> View</a>
                        <button className="admin-btn-ghost" style={{ padding: "0.375rem 0.625rem" }}><Pencil size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button className="admin-btn-ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
              <span style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>{"Page " + page + " of " + totalPages}</span>
              <button className="admin-btn-ghost" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
