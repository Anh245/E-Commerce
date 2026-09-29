import { CategoryState } from "@/types/category.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: CategoryState = {
    name: null,
    description: null,
    slug: null,

}

const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        setCategory: (state, action: PayloadAction<CategoryState>) => {
            state.name = action.payload.name;
            state.description = action.payload.description;
            state.slug = action.payload.slug;
        }

    }
})
export const { setCategory } = categorySlice.actions;

export const categoryReducer = categorySlice.reducer;