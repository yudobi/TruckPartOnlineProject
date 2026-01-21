import { Outlet } from "react-router";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white antialiased selection:bg-red-600 selection:text-white">
      <Navbar />
      {/* Added pt-20 to account for fixed navbar */}
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
