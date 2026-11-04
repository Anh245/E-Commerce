"use client";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  Appearance,
  loadStripe,
  StripeElementsOptions,
} from "@stripe/stripe-js";
import styles from "./stripe-payment-form.module.scss";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
export function StripePaymentProvicder({
  clientSecret,
  children,
}: {
  clientSecret: string;
  children: React.ReactNode;
}) {
  const appearance: Appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#de6824",
      colorBackground: "#ffffff",
      colorText: "#1e293b",
      colorDanger: "#ef4444",
      fontFamily: "poppins",
      spacingUnit: "4px",
      borderRadius: "6px",
    },
  };

  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };
  return <Elements stripe={stripePromise} options={options}>{children}</Elements>;
}

export function StripePaymentForm({
  amount,
  orderId,
  onSuccess,
  onError,
}: {
  amount: number;
  orderId: string;
  onSuccess: (paymentIntent: string) => Promise<void>;
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [erroMessage, setErrorMessage] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/return?orderId=${encodeURIComponent(orderId)}`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || " An error occured with you payment");
        onError(error.message || "Payment failed");
      } else if (paymentIntent?.status === "succeeded") {
        await onSuccess(paymentIntent.id);
      } else {
        onError("Thanh toán đang chờ xử lý. Vui lòng kiểm tra đơn hàng trước khi thử lại.");
      }
    } catch {
      setErrorMessage("An unexpected error");
      toast.error("Payment Error");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <PaymentElement />
      <div className={styles.submitContainer}>
        <button
          type="submit"
          disabled={!stripe || !elements || isLoading}
          className={styles.submitButton}
        >
          {isLoading ? (
            <>
              <Loader2 className={styles.spinner} />
              Đang xử lý…
            </>
          ) : (
            `Thanh toán $${amount.toFixed(2)}`
          )}
        </button>
      </div>
      {erroMessage && <div className={styles.errorMessage}>{erroMessage}</div>}
    </form>
  );
}
