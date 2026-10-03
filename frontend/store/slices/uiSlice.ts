import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UIState {
  adminSidebarCollapsed: boolean;
  theme: "light" | "dark";
  searchQuery: string;
}

const initialState: UIState = {
  adminSidebarCollapsed: false,
  theme: "light",
  searchQuery: "",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleAdminSidebar: (state) => {
      state.adminSidebarCollapsed = !state.adminSidebarCollapsed;
    },
    setAdminSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.adminSidebarCollapsed = action.payload;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  toggleAdminSidebar,
  setAdminSidebarCollapsed,
  setTheme,
  toggleTheme,
  setSearchQuery,
} = uiSlice.actions;

export default uiSlice.reducer;
