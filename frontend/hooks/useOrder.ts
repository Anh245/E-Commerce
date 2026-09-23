import { CartService } from "@/services/api/cart.service";
import { OrderService } from "@/services/api/order.service";
import { IRootState } from "@/store";
import { CreateOrderRequest, Order } from "@/types/order.type";

import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

export function useOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guestCart = useSelector((state: IRootState) => state.cart.items);
  const [order, setOrder] = useState<Order | null>(null);

  //create Order
  const createOrder = useCallback(
    async (data: CreateOrderRequest): Promise<Order | null> => {
      setLoading(true);

      try {
        if (guestCart.length > 0) {
          await CartService.mergeCart(
            guestCart.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
            })),
          );
        }

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
