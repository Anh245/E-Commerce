import { authService } from "@/services/api/auth.Service";
import { IRootState, useAppDispacth } from "@/store";
import { setAuth, clearAuth, updateUser } from "@/store/slices/authSlice";
import { LoginCredentials, RegisterCredentials, User } from "@/types/auth.type";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";

export function useAuth() {
  const authState = useSelector((state: IRootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispacth();

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      dispatch(clearAuth());
      setIsLoading(false);
    }
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    dispatch(updateUser(userData));
  };

  const login = async (credentials: LoginCredentials): Promise<User | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      dispatch(
        setAuth({
          accessToken: response.accessToken,
          user: response.user,
        }),
      );
      return response.user;
    } catch (err: unknown) {
      const msg =
        (isAxiosError<{ message?: string | string[] }>(err) ? err.response?.data?.message : undefined) ??
        "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.";
      setError(Array.isArray(msg) ? msg[0] : msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(credentials);
      dispatch(
        setAuth({
          accessToken: response.accessToken,
          user: response.user,
        }),
      );
      return true;
    } catch (err: unknown) {
      const msg =
        (isAxiosError<{ message?: string | string[] }>(err) ? err.response?.data?.message : undefined) ?? "Đăng ký thất bại. Vui lòng thử lại.";
      setError(Array.isArray(msg) ? msg[0] : msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading,
    error,
    logout,
    login,
    register,
    updateCurrentUser,
  };
}
