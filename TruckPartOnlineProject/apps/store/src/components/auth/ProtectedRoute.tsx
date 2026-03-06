import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "@hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Wraps protected routes and redirects unauthenticated users to /auth.
 * Preserves the intended destination via location state so that after login
 * the app can redirect the user back to where they were trying to go.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
