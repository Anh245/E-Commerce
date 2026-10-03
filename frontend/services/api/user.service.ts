import { apiClient } from "./axios.config";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileDto {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
}

export interface ChangePasswordDto {
  currentPassword?: string;
  oldPassword?: string;
  newPassword?: string;
}

export const UserService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>("/users/me");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileDto): Promise<UserProfile> => {
    const response = await apiClient.patch<UserProfile>("/users/me", data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordDto): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>("/users/me/password", data);
    return response.data;
  },

  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>("/users/me");
    return response.data;
  },

  // Admin APIs
  getAllUsers: async (): Promise<UserProfile[]> => {
    const response = await apiClient.get<UserProfile[]>("/users");
    return response.data;
  },

  getUserById: async (id: string): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(`/users/${id}`);
    return response.data;
  },

  deleteUser: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/users/${id}`);
    return response.data;
  },
};
