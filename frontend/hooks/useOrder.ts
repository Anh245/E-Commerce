import { OrderService } from "@/services/api/order.service";
import { CreateOrderRequest, Order } from "@/types/order.type";

import { useCallback, useState } from "react";

export function useOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  //create Order
  const createOrder = useCallback(
    async (data: CreateOrderRequest): Promise<Order | null> => {
      setLoading(true);

      try {
        const response = await OrderService.createOrder(data);
        if (response.data) {
          setOrder(response.data);
          return response.data;
        }
        throw new Error(response.message ?? "Failed to create order");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to confirm payment intent";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    order,
    error,
    createOrder,
    loading,
  };
}
