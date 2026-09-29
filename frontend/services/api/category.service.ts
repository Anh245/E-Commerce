import { CategoriesResponse } from "@/types/category.type";
import { apiClient } from "./axios.config";

export const CategoryService = {
    getAllCategories: async () => {
        const response = await apiClient.get<CategoriesResponse>("/category", {
            params: {
                isActive: true,
            },
        });

        return response.data; // { data: Category[], meta: PaginationMeta }
    }
}