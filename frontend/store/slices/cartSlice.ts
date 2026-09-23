import { CartItem, CartState } from "@/types/cart.type";
import { Product } from "@/types/product.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { actionAsyncStorage } from "next/dist/client/components/server-async-storage";
import { getTraceItems } from "next/dist/next-devtools/dev-overlay/components/request-insights/trace-viewer";

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

const caculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price, 0);
  return { totalItems, totalPrice };
};
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.id,
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          product: action.payload,
          quantity: 1,
          price: action.payload.price,
          id: crypto.randomUUID(),
          cartId: "",
          productId: action.payload.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      const totals = caculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
    },

    decrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find(
        (item) => item.productId === action.payload,
      );

      if (item) {
        if (item.quantity <= 1) {
          state.items = state.items.filter(
            (item) => item.product.id !== action.payload,
          );
        } else {
          item.quantity -= 1;
        }

        const totals = caculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
      }
    },

    incrementQuantityAction: (state, action: PayloadAction<string>) => {
      const item = state.items.find(
        (item) => item.product.id === action.payload,
      );

      if (item) {
        item.quantity += 1;

        const totals = caculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload,
      );
      const totals = caculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
    },

    clearAllCartAction: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    },
  },
});

export const {
  addToCart,
  decrementQuantity,
  incrementQuantityAction,
  removeFromCart,
  clearAllCartAction,
} = cartSlice.actions;
export default cartSlice.reducer;
