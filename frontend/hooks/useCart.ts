import { IRootState } from "@/store";
import { CartItem } from "@/types/cart.type";
import { Product } from "@/types/product.types";
import {
  addToCart as addToCartAction,
  decrementQuantity,
} from "@/store/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";

export function useCart() {
  const reduxCart = useSelector((state: IRootState) => state.cart);
  const items: CartItem[] = reduxCart.items;

  const dispatch = useDispatch();

  const addProductToCart = async (product: Product) => {
    dispatch(addToCartAction(product));
  };

  const decrementProductQuantity = async (productId: string) => {
    dispatch(decrementQuantity(productId));
  };
  return {
    items,
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: reduxCart.totalPrice,
    addProductToCart,
    decrementProductQuantity,
  };
}
