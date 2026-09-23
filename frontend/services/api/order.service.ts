import { CreateOrderRequest, OrderResponse } from "@/types/order.type";
import { apiClient } from "./axios.config";

export const OrderService = {
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await apiClient.post<OrderResponse>("/orders", data);

    return response.data;
  },
};
