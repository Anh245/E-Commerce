"use client";

import React, { useEffect, useRef, useState } from "react";
import CheckoutHeader from "./CheckoutHeader";
import CheckoutSteps from "./CheckoutSteps";
import styles from "./checkout.module.scss";
import PaymentMethodCard from "./PaymentMethodCard";
import { Check, CreditCard } from "lucide-react";
import { usePayment } from "@/hooks/usePayment";
import {
  StripePaymentForm,
  StripePaymentProvicder,
} from "./StripePaymentProvicder";
import { useCart } from "@/hooks/useCart";
import { OrderItem } from "@/types/order.type";
import { useRouter } from "next/navigation";
import { useOrder } from "@/hooks/useOrder";
import { useAuth } from "@/hooks/useAuth";

type Step = 1 | 2 | 3;

export default function CheckoutClient() {
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const { clientSecret, confirmPayment, createPaymentIntent } = usePayment();
  const { totalPrice, items, clearAllCart } = useCart();
  const [orderId, setOrderId] = useState<string>("");
  // Guard ref: prevent re-triggering the order creation effect
  const orderCreationTriggered = useRef(false);
  const router = useRouter();
  const { createOrder } = useOrder();
  const { isAuthenticated } = useAuth();

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPayment(method);
    setStripeError(null);
  };

  // Redirect unauthenticated users — fixed: missing leading "/"
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/checkout");
    }
  }, [isAuthenticated, router]);

  // Redirect to cart when cart is empty (only before order is created)
  useEffect(() => {
    if (items.length === 0 && !orderId) {
      router.push("/cart");
    }
  }, [orderId, items, router]);

  // Create order once when payment method is selected
  useEffect(() => {
    if (
      !selectedPayment ||
      orderId ||
      isCreatingOrder ||
      clientSecret ||
      orderCreationTriggered.current
    ) {
      return;
    }

    orderCreationTriggered.current = true;

    const createOrderAutomatically = async () => {
      setIsCreatingOrder(true);
      setStripeError(null);

      try {
        const cartItems: OrderItem[] = items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        }));

        const order = await createOrder({
          items: cartItems,
          shippingAddress: "Kim chung, Hoai Duc, Ha Noi",
        });

        if (!order) {
          throw new Error("Failed to create order");
        }

        // Save orderId so success screen can display it
        setOrderId(order.id);

        if (selectedPayment === "stripe") {
          const paymentCreated = await createPaymentIntent({
            orderId: order.id,
            amount: totalPrice,
            description: "Order payment for ecommerce purchase",
            currency: "usd",
          });

          if (!paymentCreated) {
            throw new Error("Failed to create payment intent");
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to process order";
        setStripeError(errorMessage);
        console.error("Order creation error", err);
        // Reset the guard so user can retry
        orderCreationTriggered.current = false;
      } finally {
        setIsCreatingOrder(false);
      }
    };

    createOrderAutomatically();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPayment]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const confirmed = await confirmPayment({
        orderId,
        paymentIntentId,
      });

      if (!confirmed) {
        throw new Error("Failed to confirm payment");
      }

      await clearAllCart();
      setCurrentStep(3);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to confirm payment";
      setStripeError(errorMessage);
    }
  };

  const handlePaymentError = (error: string) => {
    setStripeError(error);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <CheckoutHeader />
        <CheckoutSteps currentStep={currentStep} />
        <div className={styles.content}>
          {currentStep === 1 && (
            <div className={styles.stepContent}>
              <h2>Select Payment Method</h2>

              <div className={styles.paymentMethods}>
                {/* Stripe */}
                <PaymentMethodCard
                  method="stripe"
                  selectedMethod={selectedPayment}
                  onSelect={handlePaymentMethodSelect}
                  icon={<CreditCard />}
                  title="Credit / Debit Card"
                  description="Pay securely with Stripe"
                >
                  {stripeError && (
                    <div className={styles.errorMessage}>{stripeError}</div>
                  )}

                  {isCreatingOrder && !clientSecret && (
                    <div className={styles.loadingContainer}>
                      <div className={styles.spinner}></div>
                      <span className={styles.loadingText}>
                        Preparing payment...
                      </span>
                    </div>
                  )}

                  {clientSecret && (
                    <StripePaymentProvicder
                      clientSecret={clientSecret}
                      amount={totalPrice}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    >
                      <StripePaymentForm
                        amount={totalPrice}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </StripePaymentProvicder>
                  )}
                </PaymentMethodCard>
              </div>

              {/* Order Summary */}
              <div className={styles.summary}>
                <h3>Order Summary</h3>
                <div className={styles.summaryRow}>
                  <span>Items ({items.length})</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <hr className={styles.divider} />
                <div className={styles.summaryTotal}>
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className={styles.stepContent}>
              <div className={styles.success}>
                <div className={styles.successIcon}>
                  <Check size={48} strokeWidth={2.5} />
                </div>
                <h2>Order Placed Successfully</h2>
                <p>Your order #{orderId} has been confirmed</p>
                <p className={styles.shippingInfo}>
                  Shipping to{" "}
                  <strong>Kim chung, Hoai Duc, Ha Noi</strong>
                </p>

                <button
                  onClick={() => router.push("/user/orders")}
                  className={styles.continueButton}
                >
                  View My Orders
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
