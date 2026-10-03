import { CreateOrderRequest, Order, OrderResponse } from "@/types/order.type";
import { apiClient } from "./axios.config";

export interface OrderQueryParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedOrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

export const OrderService = {
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await apiClient.post<OrderResponse>("/orders", data);
    return response.data;
  },

  // User APIs
  getMyOrders: async (params?: OrderQueryParams): Promise<PaginatedOrdersResponse> => {
    const response = await apiClient.get<PaginatedOrdersResponse>("/orders", { params });
    return response.data;
  },

  getMyOrderById: async (id: string): Promise<OrderResponse> => {
    const response = await apiClient.get<OrderResponse>(`/orders/${id}`);
    return response.data;
  },

  updateMyOrder: async (id: string, data: any): Promise<OrderResponse> => {
    const response = await apiClient.patch<OrderResponse>(`/orders/${id}`, data);
    return response.data;
  },

  cancelMyOrder: async (id: string): Promise<OrderResponse> => {
    const response = await apiClient.delete<OrderResponse>(`/orders/${id}`);
    return response.data;
  },

  // Admin APIs
  getAllOrdersAdmin: async (params?: OrderQueryParams): Promise<PaginatedOrdersResponse> => {
    const response = await apiClient.get<PaginatedOrdersResponse>("/orders/admin/all", { params });
    return response.data;
  },

  getOrderByIdAdmin: async (id: string): Promise<OrderResponse> => {
    const response = await apiClient.get<OrderResponse>(`/orders/admin/${id}`);
    return response.data;
  },

  updateOrderStatusAdmin: async (id: string, data: { status: string }): Promise<any> => {
    const response = await apiClient.patch(`/orders/admin/${id}`, data);
    return response.data;
  },

  cancelOrderAdmin: async (id: string): Promise<OrderResponse> => {
    const response = await apiClient.delete<OrderResponse>(`/orders/admin/${id}`);
    return response.data;
  },
};
