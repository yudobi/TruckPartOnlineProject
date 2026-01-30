import { createContext, useContext } from "react";
import { type UserLoginInfo } from "../types/auth";

export interface AuthContextType {
  user: UserLoginInfo | null;
  isAuthenticated: boolean;
  login: (user: UserLoginInfo) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}