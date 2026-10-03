import {
  ConfirmPaymentRequest,
  CreatePaymentIntentRequest,
  PaymentResponse,
} from "@/types/payment.type";
import { apiClient } from "./axios.config";

export interface PaymentItem {
  id: string;
  orderId?: string;
  amount: number;
  status: string;
  currency?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt?: string;
}

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

  getMyPayments: async (): Promise<PaymentItem[]> => {
    const response = await apiClient.get<PaymentItem[]>("/payments");
    return Array.isArray(response.data) ? response.data : [];
  },

  getAllPaymentsAdmin: async (): Promise<PaymentItem[]> => {
    const response = await apiClient.get<PaymentItem[]>("/payments");
    return Array.isArray(response.data) ? response.data : [];
  },
};

export type {
  ConfirmPaymentRequest,
  CreatePaymentIntentRequest,
  PaymentResponse,
};
