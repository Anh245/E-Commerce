import {
  ConfirmPaymentRequest,
  CreatePaymentIntentRequest,
  PaymentResponse,
} from "@/types/payment.type";
import { apiClient } from "./axios.config";

export const PaymentService = {
  createPaymentIntent: async (
    data: CreatePaymentIntentRequest,
  ): Promise<PaymentResponse> => {
    const response = await apiClient.post<PaymentResponse>(
      "/payments/create-intent",
      data,
    );

    return response.data;
  },

  confirmPayment: async (
    data: ConfirmPaymentRequest,
  ): Promise<PaymentResponse> => {
    const response = await apiClient.post<PaymentResponse>(
      "/payments/confirm",
      data,
    );

    return response.data;
  },
};

export type {
  ConfirmPaymentRequest,
  CreatePaymentIntentRequest,
  PaymentResponse,
};
