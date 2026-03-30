import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./lib/i18n"; // Import i18n configuration
import { createBrowserRouter, RouterProvider } from "react-router";
import routes from "./routes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";


// Crear el router usando la configuración declarativa de rutas
const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster theme="dark" position="top-right" richColors closeButton />
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
