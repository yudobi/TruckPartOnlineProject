import { useState, type ReactNode } from "react";
import Cookies from "js-cookie";
import { type UserInfo } from "@app-types/auth";
import { AuthContext, type AuthContextType } from "@hooks/useAuth";
import apiClient from "@/services/apiClient";

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

  const login = (userData: UserInfo) => {
    setUser(userData);

    // Configuramos el token en el apiClient
    if (userData.accessToken) {
      apiClient.setAuthToken(userData.accessToken);
    }

    // Guardamos en la cookie por 7 días
    Cookies.set(AUTH_COOKIE_NAME, JSON.stringify(userData), {
      expires: 7,
      secure: window.location.protocol === "https:",
      sameSite: "strict",
    });
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
