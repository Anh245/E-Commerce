import { store } from "@/store";
import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import { refreshSession, clearSession } from "./session";


export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});


function endSession() {
  clearSession();
  if (typeof window !== "undefined" && window.location.pathname !== "/auth/login") {
    window.location.replace("/auth/login");
  }
}

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
apiClient.interceptors.response.use((response) => response, async (error: AxiosError) => {
  const request = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
  if (error.response?.status !== 401 || !request || /\/auth\/(login|register|refresh|logout)(?:\?|$)/.test(request.url ?? "")) {
    return Promise.reject(error);
  }
  if (request._retry) { endSession(); return Promise.reject(error); }
  request._retry = true;
  const session = await refreshSession();
  if (!session) { endSession(); return Promise.reject(error); }
  request.headers.Authorization = `Bearer ${session.accessToken}`;
  return apiClient(request);
});
