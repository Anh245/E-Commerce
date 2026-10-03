import { CategoriesResponse, Category } from "@/types/category.type";
import { apiClient } from "./axios.config";

export interface CategoryQueryParams {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const CategoryService = {
  getAllCategories: async (params?: CategoryQueryParams): Promise<CategoriesResponse> => {
    const response = await apiClient.get<CategoriesResponse>("/category", {
      params: {
        isActive: params?.isActive ?? true,
        ...params,
      },
    });

    return response.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/category/${id}`);
    return response.data;
  },

  createCategory: async (data: { name: string; description?: string; slug?: string }): Promise<Category> => {
    const response = await apiClient.post<Category>("/category", data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.patch<Category>(`/category/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/category/${id}`);
    return response.data;
  },
};