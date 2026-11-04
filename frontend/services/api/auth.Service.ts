
import { AuthResponse, LoginCredentials, RegisterCredentials } from "@/types/auth.type";
import { sessionClient, refreshSession, logoutSession } from "./session";

export const authService = {
  logout: logoutSession,
  refreshToken: refreshSession,

  login: async (credential: LoginCredentials): Promise<AuthResponse> => {
    const response = await sessionClient.post<AuthResponse>(
      "/login",
      credential,
    );
    return response.data;
  },

  register: async (credential: RegisterCredentials): Promise<AuthResponse> => {
    const response = await sessionClient.post<AuthResponse>(
      "/register",
      credential,
    );
    return response.data;
  },
};

