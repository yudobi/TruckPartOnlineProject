import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router";
import MainLayout from "@/components/layout/MainLayout";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/auth/AdminProtectedRoute";

// ---------------------------------------------------------------------------
// Code-split page components (each becomes its own JS chunk)
// ---------------------------------------------------------------------------
const HomePage = lazy(() => import("@/pages/HomePage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("@/pages/OrderDetailPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("@/pages/OrderConfirmationPage"));
const UserProfilePage = lazy(() => import("@/pages/UserProfilePage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const VerifyEmailPage = lazy(() => import("@/pages/VerifyEmailPage"));
const ResendVerificationPage = lazy(() => import("@/pages/ResendVerificationPage"));
const RegistrationSuccessPage = lazy(() => import("@/pages/RegistrationSuccessPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));

// Admin pages
const AdminOrdersPage = lazy(() => import("@/pages/admin/AdminOrdersPage"));
const AdminOrderDetailPage = lazy(() => import("@/pages/admin/AdminOrderDetailPage"));

// ---------------------------------------------------------------------------
// Shared loading spinner shown while a lazy chunk is being fetched
// ---------------------------------------------------------------------------
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-black">
      <span className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full text-primary animate-spin" />
    </div>
  );
}

/**
 * Configuración declarativa de rutas usando React Router 7.
 *
 * Todas las páginas se cargan de forma diferida (React.lazy) para reducir
 * el bundle inicial. Las rutas de órdenes y checkout requieren autenticación
 * y están envueltas en <ProtectedRoute>. Las rutas de admin también requieren
 * is_staff=true y están envueltas en <AdminProtectedRoute>. El árbol completo
 * está protegido por un <ErrorBoundary> para capturar errores de renderizado.
 */
export const routes: RouteObject[] = [
  {
    // Ruta raíz con layout principal
    path: "/",
    element: (
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <MainLayout />
        </Suspense>
      </ErrorBoundary>
    ),
    children: [
      {
        // Página de inicio
        index: true,
        element: <HomePage />,
      },
      {
        // Página de productos
        path: "products",
        element: <ProductsPage />,
      },
      {
        // Página acerca de
        path: "about",
        element: <AboutPage />,
      },
      {
        // Página de contacto
        path: "contact",
        element: <ContactPage />,
      },
      {
        // Página de auth (login/registro)
        path: "auth",
        element: <AuthPage />,
      },
      {
        // Página de éxito de registro
        path: "registration-success",
        element: <RegistrationSuccessPage />,
      },
      {
        // Página de verificación de email
        path: "verify-email/:uid/:token",
        element: <VerifyEmailPage />,
      },
      {
        // Página para reenviar verificación de email
        path: "resend-verification",
        element: <ResendVerificationPage />,
      },
      {
        // Página para recuperar contraseña
        path: "forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        // Página para restablecer contraseña con token
        path: "reset-password/:uid/:token/:requestId",
        element: <ResetPasswordPage />,
      },
      {
        // Página de órdenes — requiere sesión activa
        path: "orders",
        element: (
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        // Perfil de usuario — requiere sesión activa
        path: "profile",
        element: (
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        // Detalle de orden — requiere sesión activa
        path: "orders/:id",
        element: (
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        // Página de checkout — requiere sesión activa
        path: "checkout",
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        // Confirmación de orden tras pago exitoso — requiere sesión activa
        path: "orders/confirmation/:id",
        element: (
          <ProtectedRoute>
            <OrderConfirmationPage />
          </ProtectedRoute>
        ),
      },
      {
        // Listado de órdenes (admin) — requiere is_staff
        path: "admin/orders",
        element: (
          <AdminProtectedRoute>
            <AdminOrdersPage />
          </AdminProtectedRoute>
        ),
      },
      {
        // Detalle de orden (admin) — requiere is_staff
        path: "admin/orders/:id",
        element: (
          <AdminProtectedRoute>
            <AdminOrderDetailPage />
          </AdminProtectedRoute>
        ),
      },
    ],
  },
  // Ruta 404 — Página no encontrada
  {
    path: "*",
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
];

export default routes;
