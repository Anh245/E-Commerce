import {
  Product,
  ProductQueryParams,
  ProductsResponse,
} from "@/types/product.types";
import { apiClient } from "./axios.config";

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

  static async createProduct(data: any): Promise<Product> {
    const response = await apiClient.post<Product>(this.ENDPOINT, data);
    return response.data;
  }

  static async updateProduct(id: string, data: any): Promise<Product> {
    const response = await apiClient.patch<Product>(`${this.ENDPOINT}/${id}`, data);
    return response.data;
  }

  static async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`${this.ENDPOINT}/${id}`);
    return response.data;
  }
}
