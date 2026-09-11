import { Category } from "./category.type";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  //   imageUrl: string;
  quantity: number;
  stock: number;
  sku: string;
  imageUrl: string;
  category: string;
  categoryId: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface ProductsResponse {
  data: Product[];
  meta: PaginationMeta;
}
