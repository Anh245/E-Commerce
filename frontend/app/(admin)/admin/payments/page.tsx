"use client";
import AdminHeader from "@/components/modules/admin/AdminHeader";
import { PaymentService } from "@/services/api/payment.service";
import { useEffect, useState } from "react";

const STATUS_CLASS: Record<string, string> = {
  COMPLETED: "badge-delivered", PENDING: "badge-pending", FAILED: "badge-cancelled",
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    PaymentService.getAllPaymentsAdmin()
      .then(setPayments)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <AdminHeader title="Payments" subtitle={`${payments.length} payment records`} />
      <div className="admin-content">
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Order ID</th><th>Method</th><th>Amount</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}><div style={{ height: 16, background: "#f1f5f9", borderRadius: 4 }} /></td>
                  ))}</tr>
                )) : payments.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "var(--admin-text-muted)" }}>No payments</td></tr>
                ) : payments.map((p) => (
                  <tr key={p.id}>
                    <td><code style={{ fontSize: "0.78rem" }}>#{p.id?.slice(0, 8)}</code></td>
                    <td><code style={{ fontSize: "0.78rem" }}>#{p.orderId?.slice(0, 8)}</code></td>
                    <td style={{ fontSize: "0.85rem" }}>{p.method ?? "—"}</td>
                    <td style={{ fontWeight: 600 }}>${Number(p.amount ?? 0).toFixed(2)}</td>
                    <td><span className={`admin-badge ${STATUS_CLASS[p.status] ?? ""}`}>{p.status}</span></td>
                    <td style={{ fontSize: "0.82rem", color: "var(--admin-text-muted)" }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}