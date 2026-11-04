import {
  Product,
  ProductQueryParams,
  ProductsResponse,
} from "@/types/product.types";
import { apiClient } from "./axios.config";

export interface ProductInput {
  name: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
  categoryId: string;
}

export class ProductService {
  private static readonly ENDPOINT = "/products";

  static async getProducts(
    params?: ProductQueryParams,
  ): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>(this.ENDPOINT, {
      params,
    });

    return response.data;
  }

  static async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`${this.ENDPOINT}/${id}`);
    return response.data;
  }

  static async createProduct(data: ProductInput, file: File): Promise<Product> {
    const response = await apiClient.post<Product>(this.ENDPOINT, this.formData(data, file), {
      headers: { "Content-Type": "multipart/form-data" }, timeout: 60000,
    });
    return response.data;
  }

  static async updateProduct(id: string, data: Partial<ProductInput>, file?: File): Promise<Product> {
    const response = await apiClient.patch<Product>(`${this.ENDPOINT}/${id}`, file ? this.formData(data, file) : data,
      file ? { headers: { "Content-Type": "multipart/form-data" }, timeout: 60000 } : undefined);
    return response.data;
  }

  private static formData(data: Partial<ProductInput>, file: File): FormData {
    const form = new FormData();
    for (const [key, value] of Object.entries(data)) if (value !== undefined) form.append(key, String(value));
    form.append("file", file);
    return form;
  }

  static async uploadImage(id: string, file: File): Promise<Product> {
    const data = new FormData();
    data.append("file", file);
    const response = await apiClient.post<Product>(`${this.ENDPOINT}/${id}/image`, data, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
    return response.data;
  }

  static async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`${this.ENDPOINT}/${id}`);
    return response.data;
  }
}
