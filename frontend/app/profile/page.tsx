"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/modules/landing/Header";
import Footer from "@/components/modules/landing/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/api/user.service";
import { OrderService } from "@/services/api/order.service";
import { PaymentService } from "@/services/api/payment.service";
import { User, Mail, Phone, MapPin, Lock, ShoppingBag, CreditCard, ArrowRight, Pencil } from "lucide-react";
import styles from "./page.module.scss";

const STATUS_CLASS: Record<string, string> = {
  PENDING: "badge-pending", SHIPPED: "badge-shipped",
  DELIVERED: "badge-delivered", CANCELLED: "badge-cancelled",
};

export default function ProfilePage() {
  const { user, isAuthenticated, updateCurrentUser } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "orders" | "payments" | "password">("info");
  const [profile, setProfile] = useState<any>(null);

  // Passwords
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/auth/login"); return; }
    UserService.getProfile().then((data) => {
      setProfile(data);
      if (data) updateCurrentUser(data);
    }).catch(console.error);
    OrderService.getMyOrders().then((res) => setOrders(res?.data ?? [])).catch(console.error).finally(() => setIsLoadingOrders(false));
    PaymentService.getMyPayments().then(setPayments).catch(console.error);
  }, [isAuthenticated, router, updateCurrentUser]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: "error", text: "Passwords do not match" }); return;
    }
    setPwLoading(true);
    try {
      await UserService.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ type: "success", text: "Password changed successfully!" });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPwMsg({ type: "error", text: err?.response?.data?.message ?? "Failed to change password" });
    } finally { setPwLoading(false); }
  };

  const displayUser = profile ?? user;

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Banner */}
        <div className={styles.banner}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>
              {displayUser?.firstName?.[0] ?? displayUser?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
          <h1 className={styles.name}>
            {displayUser?.firstName
              ? `${displayUser.firstName} ${displayUser.lastName ?? ""}`.trim()
              : displayUser?.email}
          </h1>
          <p className={styles.role}>Member</p>
          <div className={styles.stats}>
            <div className={styles.stat}><span className={styles.statNum}>{orders.length}</span><span className={styles.statLabel}>Orders</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>{payments.length}</span><span className={styles.statLabel}>Payments</span></div>
          </div>
        </div>

        <div className={styles.body}>
          {/* Tabs */}
          <div className={styles.tabs}>
            {([
              { key: "info",     label: "Personal Info", icon: User },
              { key: "orders",   label: "Orders",        icon: ShoppingBag },
              { key: "payments", label: "Payments",      icon: CreditCard },
              { key: "password", label: "Password",      icon: Lock },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                className={`${styles.tab} ${activeTab === key ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(key)}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "info" && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Personal Information</h2>
                <button className={styles.editBtn}><Pencil size={14} /> Edit</button>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}><User size={15} /></span>
                  <div>
                    <p className={styles.infoLabel}>Full Name</p>
                    <p className={styles.infoValue}>
                      {displayUser?.firstName
                        ? `${displayUser.firstName} ${displayUser.lastName ?? ""}`.trim()
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}><Mail size={15} /></span>
                  <div>
                    <p className={styles.infoLabel}>Email</p>
                    <p className={styles.infoValue}>{displayUser?.email ?? "—"}</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}><Phone size={15} /></span>
                  <div>
                    <p className={styles.infoLabel}>Phone</p>
                    <p className={styles.infoValue}>{(displayUser as any)?.phone ?? "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Order History</h2>
                <a href="/orders" className={styles.viewAll}>View all <ArrowRight size={14} /></a>
              </div>
              {isLoadingOrders ? (
                <div className={styles.loadingList}>
                  {Array.from({ length: 3 }).map((_, i) => <div key={i} className={styles.skItem} />)}
                </div>
              ) : orders.length === 0 ? (
                <p className={styles.empty}>No orders yet. <a href="/products">Shop now →</a></p>
              ) : (
                <div className={styles.orderList}>
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className={styles.orderRow}>
                      <div className={styles.orderIcon}><ShoppingBag size={16} /></div>
                      <div className={styles.orderInfo}>
                        <p className={styles.orderId}>#{o.id?.slice(0, 8)}</p>
                        <p className={styles.orderDate}>{new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`admin-badge ${STATUS_CLASS[o.status] ?? ""}`}>{o.status}</span>
                      <span className={styles.orderAmount}>${Number(o.totalAmount ?? 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "payments" && (
            <div className={styles.card}>
              <div className={styles.cardHeader}><h2>Payment History</h2></div>
              {payments.length === 0 ? (
                <p className={styles.empty}>No payment history.</p>
              ) : (
                <div className={styles.orderList}>
                  {payments.map((p) => (
                    <div key={p.id} className={styles.orderRow}>
                      <div className={styles.orderIcon}><CreditCard size={16} /></div>
                      <div className={styles.orderInfo}>
                        <p className={styles.orderId}>{p.method ?? "Payment"}</p>
                        <p className={styles.orderDate}>{new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`admin-badge ${p.status === "COMPLETED" ? "badge-delivered" : "badge-pending"}`}>{p.status}</span>
                      <span className={styles.orderAmount}>${Number(p.amount ?? 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "password" && (
            <div className={styles.card} style={{ maxWidth: 480 }}>
              <div className={styles.cardHeader}><h2>Change Password</h2></div>
              <form onSubmit={handleChangePassword} className={styles.pwForm}>
                {(["currentPassword", "newPassword", "confirmPassword"] as const).map((field) => (
                  <div key={field} className={styles.formGroup}>
                    <label className={styles.label}>
                      {field === "currentPassword" ? "Current Password" : field === "newPassword" ? "New Password" : "Confirm New Password"}
                    </label>
                    <input
                      type="password"
                      className={styles.input}
                      value={pwForm[field]}
                      onChange={(e) => setPwForm((prev) => ({ ...prev, [field]: e.target.value }))}
                      required
                      minLength={field === "newPassword" ? 6 : undefined}
                    />
                  </div>
                ))}
                {pwMsg && (
                  <div className={`${styles.pwMsg} ${pwMsg.type === "success" ? styles.pwMsgSuccess : styles.pwMsgError}`}>
                    {pwMsg.text}
                  </div>
                )}
                <button type="submit" className={styles.submitBtn} disabled={pwLoading}>
                  {pwLoading ? "Saving…" : "Change Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}