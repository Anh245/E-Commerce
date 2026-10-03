export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface CategoryState {
  items: Category[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface CategoriesResponse {
  data: Category[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryItem {
  name: string,
  description?: string,
  slug?: string,
}
