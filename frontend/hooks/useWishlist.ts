import { IRootState, useAppDispacth } from "@/store";
import {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
} from "@/store/slices/wishlistSlice";
import { Product } from "@/types/product.types";
import { useSelector } from "react-redux";

export function useWishlist() {
  const dispatch = useAppDispacth();
  const wishlistItems = useSelector((state: IRootState) => state.wishlist?.items ?? []);

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const handleToggle = (product: Product) => {
    dispatch(toggleWishlist(product));
  };

  const handleAdd = (product: Product) => {
    dispatch(addToWishlist(product));
  };

  const handleRemove = (productId: string) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleClear = () => {
    dispatch(clearWishlist());
  };

  return {
    wishlistItems,
    totalWishlistItems: wishlistItems.length,
    isInWishlist,
    toggleWishlist: handleToggle,
    addToWishlist: handleAdd,
    removeFromWishlist: handleRemove,
    clearWishlist: handleClear,
  };
}
