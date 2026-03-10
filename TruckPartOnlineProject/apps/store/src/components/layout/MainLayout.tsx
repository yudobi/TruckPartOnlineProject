import { Outlet } from "react-router";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import EmailVerificationBanner from "@/components/auth/EmailVerificationBanner";

export default function MainLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen bg-black text-white antialiased selection:bg-red-600 selection:text-white">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-red-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:outline-none"
          >
            Saltar al contenido principal
          </a>
          <Navbar />
          <EmailVerificationBanner />
          {/* Added pt-20 to account for fixed navbar */}
          <main id="main-content" tabIndex={-1} className="flex-grow pt-20">
            <Outlet />
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
