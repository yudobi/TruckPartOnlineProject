import { Navigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";

interface VerifiedRouteProps {
  children: ReactNode;
}

/**
 * Componente que protege rutas que requieren que el usuario
 * esté autenticado Y tenga su email verificado.
 */
export default function VerifiedRoute({ children }: VerifiedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user && user.is_verified === false) {
    return <Navigate to="/resend-verification" replace />;
  }

  return <>{children}</>;
}
