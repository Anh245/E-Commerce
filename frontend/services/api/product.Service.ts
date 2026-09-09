import { ProductQueryParams, ProductsResponse } from "@/types/product.types";
import { apiClient } from "./axios.config";

export class ProductService {
  private static readonly ENPOINT = "/products";

  static async getProducts(
    params?: ProductQueryParams,
  ): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>(this.ENPOINT, {
      params,
    });

    return response.data;
  }
}
