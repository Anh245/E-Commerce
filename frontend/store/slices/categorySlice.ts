import { Category, CategoryState } from "@/types/category.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: CategoryState = {
  items: [],
  selectedCategoryId: null,
  isLoading: false,
  error: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategoryId = action.payload;
    },
    setCategoryLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCategoryError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setCategories,
  setSelectedCategory,
  setCategoryLoading,
  setCategoryError,
} = categorySlice.actions;

export const categoryReducer = categorySlice.reducer;
export default categorySlice.reducer;