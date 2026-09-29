import { CategoryService } from "@/services/api/category.service";
import { IRootState } from "@/store";
import { setCategory } from "@/store/slices/categorySlice";
import { Category } from "@/types/category.type";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useCategory() {
  const categoryState = useSelector((state: IRootState) => state.category);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const dispatch = useDispatch();
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const getCategories = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await CategoryService.getAllCategories();
      setCategories(response.data); // response = { data: Category[], meta: PaginationMeta }
      setMeta(response.meta);

      return true;
    } catch (err) {
      const message = "Loi khi lay danh sach danh muc:" + err;
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  return {
    isLoading,
    error,
    categories,
    getCategories,
    meta,
  };
}
