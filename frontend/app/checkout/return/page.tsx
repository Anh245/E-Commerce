"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { PaymentService } from "@/services/api/payment.service";

export default function PaymentReturnPage() {
  const { user, isAuthenticated } = useAuth();
  const { clearAllCart } = useCart();
  const started = useRef(false);
  const [message, setMessage] = useState("Đang xác nhận thanh toán với máy chủ…");

  useEffect(() => {
    if (!user || !isAuthenticated || started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const paymentIntentId = params.get("payment_intent");
    // Drop Stripe client_secret from the address bar once the needed IDs are read.
    window.history.replaceState(null, "", window.location.pathname);
    const confirm = async () => {
      if (!orderId || !paymentIntentId) throw new Error("Missing payment IDs");
      const result = await PaymentService.confirmPayment({ orderId, paymentIntentId });
      if (!result.success) throw new Error("Payment not confirmed");
      await clearAllCart();
      sessionStorage.removeItem("checkout-order:" + user.id);
      setMessage("Thanh toán đã được máy chủ xác nhận thành công.");
    };
    confirm().catch(() => setMessage("Chưa xác nhận được thanh toán. Vui lòng kiểm tra đơn hàng; webhook sẽ tiếp tục cập nhật kết quả."));
  }, [user, isAuthenticated, clearAllCart]);

  return <main style={{ padding: "3rem", maxWidth: 720, margin: "auto" }}>
    <h1>Kết quả thanh toán</h1>
    <p role="status">{isAuthenticated ? message : "Vui lòng đăng nhập để xem kết quả trong danh sách đơn hàng."}</p>
    <Link href={isAuthenticated ? "/orders" : "/auth/login?redirect=/orders"}>Xem đơn hàng</Link>
  </main>;
}
