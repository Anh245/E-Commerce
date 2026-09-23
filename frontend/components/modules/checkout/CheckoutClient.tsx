"use client";

import React, { useEffect, useState } from "react";
import CheckoutHeader from "./CheckoutHeader";
import CheckoutSteps from "./CheckoutSteps";
import styles from "./checkout.module.scss";
import PaymentMethodCard from "./PaymentMethodCard";
import { Check, CreditCard } from "lucide-react";
import { div, tr } from "motion/react-client";
import { usePayment } from "@/hooks/usePayment";
import {
  StripePaymentForm,
  StripePaymentProvicder,
} from "./StripePaymentProvicder";
import { useCart } from "@/hooks/useCart";

import { OrderItem } from "@/types/order.type";
import { useRouter } from "next/navigation";
import { useOrder } from "@/hooks/useOrder";
import { error } from "next/dist/build/output/log";
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
  const router = useRouter();
  const { createOrder } = useOrder();
  const { isAuthenticated } = useAuth();
  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPayment(method);
    setStripeError(null);
  };

  //use Effect

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("auth/login?redirect=/checkout");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (items.length == 0 && !orderId) {
      router.push("/cart");
    }
  }, [orderId, items, router]);

  useEffect(() => {
    const createOrderAutomatically = async () => {
      if (selectedPayment && !orderId && !isCreatingOrder && !clientSecret) {
        setIsCreatingOrder(true);
        setStripeError(null);
      }

      try {
        const cartItems: OrderItem[] = items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        }));

        const order = await createOrder({
          items: cartItems,
          shippingAddress: "Kim chung, Hoai Duct , Ha Noi",
        });

        if (!order) {
          throw new Error("Failed to create order");
        }

        if (selectedPayment == "stripe") {
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
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create payment intent";

        setStripeError(errorMessage);
        console.log("Order creation error", error);

        return false;
      } finally {
        setIsCreatingOrder(false);
      }
    };

    createOrderAutomatically();
  }, [
    selectedPayment,
    orderId,
    isCreatingOrder,
    clientSecret,
    items,
    createOrder,
    totalPrice,
  ]);

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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : " Failed to create payment";

      setStripeError(errorMessage);
    }
  };

  const handlePaymentError = async (error: string) => {
    setStripeError(error);
  };

  return (
    <section className={styles.section}>
      {/* container */}
      <div className={styles.container}>
        <CheckoutHeader />
        <CheckoutSteps currentStep={currentStep} />
        <div className={styles.content}>
          {currentStep === 1 && (
            <div className={styles.stepContent}>
              <h2>Select payment Method</h2>

              <div className={styles.paymentMethods}>
                {/* stripe */}
                <PaymentMethodCard
                  method="stripe"
                  selectedMethod={selectedPayment}
                  onSelect={handlePaymentMethodSelect}
                  icon={<CreditCard />}
                  title="Credit / Debit Card"
                  description="Pay securely with stripe"
                >
                  {stripeError && (
                    <div className={styles.errorMessage}>{stripeError}</div>
                  )}

                  {isCreatingOrder && !clientSecret && (
                    <div className={styles.loadingContainer}>
                      <div className={styles.spinner}></div>

                      <div className={styles.loadingText}></div>
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

                {/* other payments methods */}
              </div>
              {/* summary */}
              <div className={styles.sumary}>
                <h3>Order summary</h3>
                <div className={styles.sumaryRow}>
                  <span>Items ({items.length})</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>Free</span>

                  <hr className={styles.divider} />
                  <div className={styles.sumaryTotal}>
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className={styles.stepContent}>
              <div className={styles.success}>
                <Check size={20} strokeWidth={2} />
                <h2>Order placed successfully</h2>
                <p>Your order #{orderId} has been cofirmed</p>
                <p className={styles.shippingInfo}>
                  Shipping to
                  <strong>Kim chung,Hoai Duc, Ha Noi</strong>
                </p>

                <button
                  onClick={() => router.push("/user/orders")}
                  className={styles.continueButton}
                >
                  Go back to my orders
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
