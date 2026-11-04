"use client";

import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import CheckoutHeader from "./CheckoutHeader";
import CheckoutSteps from "./CheckoutSteps";
import styles from "./checkout.module.scss";
import { StripePaymentForm, StripePaymentProvicder } from "./StripePaymentProvicder";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { OrderService } from "@/services/api/order.service";
import { PaymentService } from "@/services/api/payment.service";

export default function CheckoutClient() {
  const { items, totalPrice, clearAllCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [paid, setPaid] = useState(false);
  const submitting = useRef(false);
  const pendingOrderId = useRef("");
  const storageKey = user ? "checkout-order:" + user.id : "";

  useEffect(() => {
    if (!isAuthenticated) router.replace("/auth/login?redirect=/checkout");
  }, [isAuthenticated, router]);

  const showError = (err: unknown) => {
    const message = isAxiosError(err) ? err.response?.data?.message : err instanceof Error ? err.message : null;
    setError(Array.isArray(message) ? message.join(", ") : message || "Không xử lý được thanh toán. Vui lòng thử lại.");
  };

  const complete = async () => {
    setPaid(true);
    await clearAllCart();
    if (storageKey) sessionStorage.removeItem(storageKey);
  };

  const prepare = async () => {
    if (submitting.current || !user || !items.length) return;
    if (!shippingAddress.trim()) { setError("Vui lòng nhập địa chỉ giao hàng."); return; }
    submitting.current = true; setBusy(true); setError("");
    try {
      let id = pendingOrderId.current;
      const fingerprint = JSON.stringify(items.map((item) => [item.product.id, item.quantity]).sort());
      if (!id && storageKey) {
        try {
          const saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
          if (saved?.fingerprint === fingerprint && typeof saved.orderId === "string") id = saved.orderId;
        } catch { /* A malformed local cache should not block checkout. */ }
      }
      if (!id) {
        const response = await OrderService.createOrder({
          items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
          shippingAddress: shippingAddress.trim(),
        });
        if (!response.data) throw new Error("Không tạo được đơn hàng.");
        id = response.data.id;
        // Retain the order before asking Stripe, so a failed intent request can be retried.
        pendingOrderId.current = id;
        if (storageKey) sessionStorage.setItem(storageKey, JSON.stringify({ orderId: id, fingerprint }));
      }
      pendingOrderId.current = id;
      setOrderId(id);
      const response = await PaymentService.createPaymentIntent({ orderId: id, currency: "usd" });
      if (!response.success) throw new Error(response.message || "Không chuẩn bị được thanh toán.");
      setAmount(response.data.amount);
      if (response.data.paid) { await complete(); return; }
      if (!response.data.clientSecret) throw new Error("Không nhận được phiên thanh toán.");
      setClientSecret(response.data.clientSecret);
    } catch (err) { showError(err); }
    finally { submitting.current = false; setBusy(false); }
  };

  const confirm = async (paymentIntentId: string) => {
    try {
      const response = await PaymentService.confirmPayment({ orderId, paymentIntentId });
      if (!response.success) throw new Error(response.message || "Chưa xác nhận được thanh toán.");
      await complete();
    } catch (err) {
      showError(err);
      // Reopen the same intent to reconcile a payment that Stripe may already have accepted.
      setClientSecret("");
    }
  };

  if (!isAuthenticated) return null;
  return (
    <section className={styles.section}><div className={styles.container}>
      <CheckoutHeader /><CheckoutSteps currentStep={paid ? 3 : 1} />
      <div className={styles.content}><div className={styles.stepContent}>
        {paid ? <div className={styles.success}>
          <div className={styles.successIcon}><Check size={48} /></div>
          <h2>Thanh toán thành công</h2><p>Đơn hàng #{orderId} đã được xác nhận.</p>
          <button className={styles.continueButton} onClick={() => router.push("/orders")}>Xem đơn hàng của tôi</button>
        </div> : <>
          <h2>Thanh toán bằng thẻ</h2>
          <label>Địa chỉ giao hàng
            <input value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)}
              disabled={busy || !!orderId} required autoComplete="street-address" />
          </label>
          {error && <div role="alert" className={styles.errorMessage}>{error}</div>}
          {!items.length ? <p>Giỏ hàng đang trống. <button onClick={() => router.push("/cart")}>Quay lại giỏ hàng</button></p>
            : !clientSecret && <button className={styles.continueButton} disabled={busy} onClick={prepare}>
              {busy ? "Đang chuẩn bị…" : orderId ? "Thử lại thanh toán" : "Tiếp tục thanh toán"}
            </button>}
          {clientSecret && amount !== null && <StripePaymentProvicder clientSecret={clientSecret}>
            <StripePaymentForm orderId={orderId} amount={amount} onSuccess={confirm} onError={setError} />
          </StripePaymentProvicder>}
          <div className={styles.summary}>
            <h3>Tóm tắt đơn hàng</h3>
            <div className={styles.summaryRow}><span>Sản phẩm ({items.length})</span><span>${(amount ?? totalPrice).toFixed(2)} USD</span></div>
            <div className={styles.summaryRow}><span>Phí vận chuyển</span><span>Miễn phí</span></div>
            <p>Giá thanh toán được xác nhận từ đơn hàng trên máy chủ.</p>
          </div>
        </>}
      </div></div>
    </div></section>
  );
}
