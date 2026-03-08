import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { type UserInfo, type LoginCredentials, type RegisterCredentials } from "@app-types/auth";
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

      toast.success("¡Sesión iniciada correctamente!");
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Error al iniciar sesión. Verifica tus credenciales.");
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const registerResponse = await authService.register(credentials);
      
      // Después del registro, configuramos el token y el usuario
      apiClient.setAuthToken(registerResponse.access);
      
      const userData: UserInfo = {
        ...registerResponse.user,
        accessToken: registerResponse.access,
        refreshToken: registerResponse.refresh,
      };

      setUser(userData);

      // Guardamos en la cookie por 7 días
      Cookies.set(AUTH_COOKIE_NAME, JSON.stringify(userData), {
        expires: 7,
        secure: window.location.protocol === "https:",
        sameSite: "strict",
      });

      toast.success("¡Cuenta creada exitosamente!");
    } catch (error) {
      console.error("Register Error:", error);
      toast.error("Error al crear la cuenta. Inténtalo de nuevo.");
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    apiClient.setAuthToken(null);
    Cookies.remove(AUTH_COOKIE_NAME);
    toast("Sesión cerrada");
  };

  const updateUser = async (data: Partial<UserInfo>) => {
    try {
      const updatedInfo = await authService.updateProfile(
        data as Pick<UserInfo, 'full_name' | 'phone_number' | 'address'>
      );
      const currentUser = user;
      const updatedUser: UserInfo = {
        ...currentUser,
        ...updatedInfo,
        accessToken: currentUser?.accessToken,
        refreshToken: currentUser?.refreshToken,
      };
      setUser(updatedUser);
      Cookies.set(AUTH_COOKIE_NAME, JSON.stringify(updatedUser), {
        expires: 7,
        secure: window.location.protocol === "https:",
        sameSite: "strict",
      });
      toast.success("Perfil actualizado correctamente.");
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Error al actualizar el perfil. Inténtalo de nuevo.");
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
