import type { RouteObject } from "react-router";
import MainLayout from "@/components/layout/MainLayout";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import AuthPage from "@/pages/AuthPage";
import OrdersPage from "@/pages/OrdersPage";
import OrderDetailPage from "@/pages/OrderDetailPage";
import CheckoutPage from "@/pages/CheckoutPage";

/**
 * Configuración declarativa de rutas usando React Router 7
 *
 * Esta configuración utiliza el array de rutas (RouteObject[]) que es la forma
 * declarativa recomendada en React Router 7.
 */
export const routes: RouteObject[] = [
  {
    // Ruta raíz con layout principal
    path: "/",
    element: <MainLayout />,
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
        // Página de órdenes del usuario
        path: "orders",
        element: <OrdersPage />,
      },
      {
        // Página de checkout
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        // Página de detalle de orden
        path: "orders/:id",
        element: <OrderDetailPage />,
      },
      // Puedes agregar más rutas aquí fácilmente
      // {
      //   path: 'nueva-ruta',
      //   element: <NuevaPagina />,
      // },
    ],
  },
  // Ruta 404 - Página no encontrada (opcional)
  // {
  //   path: '*',
  //   element: <NotFoundPage />,
  // },
];

export default routes;
