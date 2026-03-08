import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "@hooks/useAuth";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

/**
 * Wraps admin-only routes. Redirects unauthenticated users to /auth
 * and non-staff users to the home page.
 */
export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!user.is_staff) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default AdminProtectedRoute;
