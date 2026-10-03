"use client";
import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/modules/admin/AdminHeader";
import { ArrowLeft, CheckCircle2, Circle, Truck, Package } from "lucide-react";
import { OrderService } from "@/services/api/order.service";
import Link from "next/link";

const STATUS_CLASS: Record<string, string> = {
  PENDING: "badge-pending", SHIPPED: "badge-shipped",
  DELIVERED: "badge-delivered", CANCELLED: "badge-cancelled",
};

const TIMELINE = [
  { key: "PENDING",   label: "Order Placed", icon: Package },
  { key: "SHIPPED",   label: "Shipped",      icon: Truck },
  { key: "DELIVERED", label: "Delivered",    icon: CheckCircle2 },
];

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    OrderService.getOrderByIdAdmin(params.id)
      .then((res: any) => setOrder(res?.data ?? res))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) return (
    <>
      <AdminHeader title="Order Detail" />
      <div className="admin-content" style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <span style={{ color: "var(--admin-text-muted)" }}>Loading...</span>
      </div>
    </>
  );

  if (!order) return (
    <>
      <AdminHeader title="Order Detail" />
      <div className="admin-content"><div style={{ color: "var(--admin-text-muted)", padding: "2rem" }}>Order not found.</div></div>
    </>
  );

  const statusIdx = TIMELINE.findIndex(s => s.key === order.status);

  return (
    <>
      <AdminHeader title={`Order #${order.id?.slice(0, 8)}`} subtitle={`Status: ${order.status}`} />
      <div className="admin-content">
        <Link href="/admin/orders" className="admin-btn-ghost" style={{ marginBottom: "1.25rem", display: "inline-flex" }}>
          <ArrowLeft size={15} /> Back to Orders
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="admin-card">
              <h3 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.95rem" }}>Customer Info</h3>
              <p style={{ fontSize: "0.875rem" }}>User ID: <code>{order.userId}</code></p>
              <p style={{ fontSize: "0.875rem", color: "var(--admin-text-muted)", marginTop: "0.5rem" }}>
                Created: {new Date(order.createdAt).toLocaleString()}
              </p>
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "var(--admin-bg)", borderRadius: "var(--admin-radius-md)", fontSize: "0.875rem" }}>
                <strong>Shipping:</strong> {order.shippingAddress || "N/A"}
              </div>
            </div>

            <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--admin-border)" }}>
                <h3 style={{ fontWeight: 600, fontSize: "0.95rem" }}>Order Items</h3>
              </div>
              <table className="admin-table">
                <thead><tr><th>Product ID</th><th>Qty</th></tr></thead>
                <tbody>
                  {(order.items ?? order.cartItems ?? []).map((item: any, i: number) => (
                    <tr key={i}>
                      <td style={{ fontSize: "0.82rem" }}>{item.productId}</td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="admin-card">
              <h3 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.95rem" }}>Summary</h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <span style={{ color: "var(--admin-text-muted)", fontSize: "0.875rem" }}>Total</span>
                <span style={{ fontWeight: 700 }}>${Number(order.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <span style={{ color: "var(--admin-text-muted)", fontSize: "0.875rem" }}>Status</span>
                <span className={`admin-badge ${STATUS_CLASS[order.status] ?? ""}`}>{order.status}</span>
              </div>
              <button className="admin-btn-primary" style={{ width: "100%" }}>Update Status</button>
            </div>

            <div className="admin-card">
              <h3 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.95rem" }}>Timeline</h3>
              {TIMELINE.map((step, idx) => {
                const done = idx <= statusIdx;
                const Icon = done ? step.icon : Circle;
                return (
                  <div key={step.key} style={{ display: "flex", gap: "0.75rem", paddingBottom: idx < TIMELINE.length - 1 ? "1rem" : 0 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: done ? "var(--admin-primary)" : "var(--admin-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={12} color={done ? "#fff" : "var(--admin-text-muted)"} />
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: done ? 600 : 400, color: done ? "var(--admin-text)" : "var(--admin-text-muted)" }}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}