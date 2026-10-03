import { CategoryService } from "@/services/api/category.service";
import { IRootState, useAppDispacth } from "@/store";
import {
  setCategories,
  setSelectedCategory,
  setCategoryLoading,
  setCategoryError,
} from "@/store/slices/categorySlice";
import { useCallback } from "react";
import { useSelector } from "react-redux";

export function useCategory() {
  const dispatch = useAppDispacth();
  const { items: categories, selectedCategoryId, isLoading, error } = useSelector(
    (state: IRootState) => state.category,
  );

  const getCategories = useCallback(
    async (force = false): Promise<boolean> => {
      // Nếu đã có dữ liệu và không yêu cầu force refresh thì không cần fetch lại
      if (categories.length > 0 && !force) {
        return true;
      }

      dispatch(setCategoryLoading(true));
      dispatch(setCategoryError(null));

      try {
        const response = await CategoryService.getAllCategories();
        dispatch(setCategories(response.data));
        return true;
      } catch (err: any) {
        const message = "Lỗi khi lấy danh sách danh mục: " + (err?.message ?? err);
        dispatch(setCategoryError(message));
        return false;
      }
    },
    [categories.length, dispatch],
  );

  const selectCategory = useCallback(
    (id: string | null) => {
      dispatch(setSelectedCategory(id));
    },
    [dispatch],
  );

  return {
    categories,
    selectedCategoryId,
    isLoading,
    error,
    getCategories,
    selectCategory,
  };
}
