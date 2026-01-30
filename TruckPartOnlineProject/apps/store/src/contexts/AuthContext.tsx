import { useState, type ReactNode } from "react";
import { type UserLoginInfo } from "@app-types/auth";
import { AuthContext, type AuthContextType } from "@hooks/useAuth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Inicializamos con un usuario de prueba para propósitos de demostración
  // En una app real, esto vendría de localStorage o una validación de token
  const [user, setUser] = useState<UserLoginInfo | null>({
    id: "1",
    name: "Jorge User",
    email: "jorge@example.com",
    username: "jorge@example.com",
    role: "Jorge User",
  });

  const login = (userData: UserLoginInfo) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
