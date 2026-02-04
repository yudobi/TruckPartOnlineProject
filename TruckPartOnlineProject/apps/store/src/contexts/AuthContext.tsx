import { useState, type ReactNode } from "react";
import Cookies from "js-cookie";
import { type UserInfo, type LoginCredentials } from "@app-types/auth";
import { AuthContext, type AuthContextType } from "@hooks/useAuth";
import apiClient from "@/services/apiClient";
import authService from "@/services/auth";

const AUTH_COOKIE_NAME = "auth_user_data";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Inicializamos el estado desde la cookie si existe
  const [user, setUser] = useState<UserInfo | null>(() => {
    const savedUser = Cookies.get(AUTH_COOKIE_NAME);
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser) as UserInfo;
        // Si hay un token, lo configuramos en el apiClient
        if (userData.accessToken) {
          apiClient.setAuthToken(userData.accessToken);
        }
        return userData;
      } catch (error) {
        console.error("Error parsing user from cookie:", error);
        Cookies.remove(AUTH_COOKIE_NAME);
        return null;
      }
    }
    return null;
  });

  const login = async (credentials: LoginCredentials) => {
    try {
      const loginResponse = await authService.login(credentials);
      // login method in authService already sets token, but we ensure it here too
      apiClient.setAuthToken(loginResponse.access);
      
      const userInfo = await authService.userInfo();
      const userData: UserInfo = {
        ...userInfo,
        accessToken: loginResponse.access,
        refreshToken: loginResponse.refresh,
      };

      setUser(userData);

      // Guardamos en la cookie por 7 días
      Cookies.set(AUTH_COOKIE_NAME, JSON.stringify(userData), {
        expires: 7,
        secure: window.location.protocol === "https:",
        sameSite: "strict",
      });
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    apiClient.setAuthToken(null);
    Cookies.remove(AUTH_COOKIE_NAME);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
