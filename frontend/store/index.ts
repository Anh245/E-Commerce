import {
  combineReducers,
  configureStore,
} from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import categoryReducer from "./slices/categorySlice";
import wishlistReducer from "./slices/wishlistSlice";
import uiReducer from "./slices/uiSlice";
import { useDispatch } from "react-redux";

const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(value: string) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

const storageEngine =
  typeof window !== "undefined" ? storage : createNoopStorage();

const persistConfig = {
  key: "root",
  storage: storageEngine,
  whitelist: ["cart", "auth", "wishlist", "ui"], // Persist cart, auth, wishlist, and ui preferences
};

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  category: categoryReducer,
  wishlist: wishlistReducer,
  ui: uiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
export const useAppDispacth = () => useDispatch<AppDispatch>();
export type IRootState = ReturnType<typeof store.getState>;
