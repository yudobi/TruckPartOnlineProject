import { Link, NavLink } from "react-router";
import {
  ChevronDown,
  User,
  LogOut,
  Settings,
  Menu,
  Package,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@components/layout/LanguageSwitcher";
import { useAuth } from "@hooks/useAuth";
import { useNavigate } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@components/ui/sheet";

import CartSidebar from "@components/cart/CartSidebar";

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="px-1 h-20 bg-red-600 flex items-center justify-center ">
              <img
                src="/logo/black-logo.svg"
                height={50}
                width={100}
                alt="logo tony truck part"
              />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white">
              TRUCK<span className="text-red-600">PART</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavItem to="/">{t("nav.home").toUpperCase()}</NavItem>
            <NavItem to="/products">{t("nav.catalog").toUpperCase()}</NavItem>
            
            <NavItem to="/about">{t("nav.about").toUpperCase()}</NavItem>
            <NavItem to="/contact">{t("nav.contact").toUpperCase()}</NavItem>

            <LanguageSwitcher />

            <CartSidebar />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 focus:outline-none cursor-pointer group">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-red-900/20 group-hover:shadow-red-900/40 transition-all duration-300 border border-white/10">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full"></span>
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-sm font-bold text-white group-hover:text-red-500 transition-colors">
                      {user?.username.split(" ")[0]}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium tracking-wider">
                      {t("common.customer")}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-black/95 border-white/10 text-white backdrop-blur-xl p-2 animate-in fade-in-0 zoom-in-95"
                  sideOffset={10}
                >
                  <DropdownMenuLabel className="font-normal mb-2">
                    <div className="flex flex-col space-y-1 p-2 rounded-md bg-white/5 border border-white/5">
                      <p className="text-sm font-medium leading-none text-white">
                        {user?.username}
                      </p>
                      <p className="text-xs leading-none text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuGroup className="space-y-1">
                    <Link to="/orders" className="w-full">
                      <DropdownMenuItem className="group cursor-pointer text-gray-300 focus:text-white focus:bg-red-600 py-2.5 transition-colors">
                        <Package className="mr-3 h-4 w-4 text-red-500 group-focus:text-white transition-colors" />
                        <span>{t("orders.title")}</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="group cursor-pointer text-gray-300 focus:text-white focus:bg-red-600 py-2.5 transition-colors">
                      <Settings className="mr-3 h-4 w-4 text-red-500 group-focus:text-white transition-colors" />
                      <span>{t("user.profile")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="my-2 bg-white/10" />

                  <DropdownMenuItem
                    className="group cursor-pointer text-red-400 focus:text-white focus:bg-red-600 py-2.5 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-3 h-4 w-4 group-focus:text-white transition-colors" />
                    <span>{t("user.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/auth"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm transition-all text-xs font-bold tracking-widest text-white"
              >
                <User className="w-4 h-4 text-red-600" />
                {t("common.login").toUpperCase()}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <CartSidebar />
            <Sheet>
              <SheetTrigger asChild>
                <button className="text-white hover:text-red-600 transition-colors p-2">
                  <Menu className="w-8 h-8" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-75 bg-black/95 border-white/10 text-white backdrop-blur-xl p-0"
              >
                <SheetHeader className="p-6 border-b border-white/10">
                  <SheetTitle className="text-white flex items-center gap-2">
                    <div className="px-1 h-8 bg-red-600 flex items-center justify-center ">
                      <span className="text-sm font-bold text-black">TONY</span>
                    </div>
                    <span className="text-lg font-bold tracking-tighter text-white">
                      TRUCK<span className="text-red-600">PART</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col p-6 space-y-6">
                  {/* Navigation Links */}
                  <div className="flex flex-col space-y-4">
                    <MobileNavItem to="/">{t("nav.home")}</MobileNavItem>
                    <MobileNavItem to="/products">
                      {t("nav.catalog")}
                    </MobileNavItem>
                    <MobileNavItem to="/about">{t("nav.about")}</MobileNavItem>
                    <MobileNavItem to="/contact">
                      {t("nav.contact")}
                    </MobileNavItem>
                  </div>

                  <div className="h-px bg-white/10 w-full" />

                  {/* Language Switcher Section */}
                  <div className="flex flex-col space-y-4">
                    <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                      {t("common.language")}
                    </span>
                    <div className="flex justify-start">
                      <LanguageSwitcher />
                    </div>
                  </div>

                  <div className="h-px bg-white/10 w-full" />

                  {/* Auth Section */}
                  <div className="flex flex-col space-y-4">
                    {isAuthenticated ? (
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-600 to-red-800 flex items-center justify-center text-white border border-white/10">
                            <User className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">
                              {user?.username}
                            </span>
                            <span className="text-xs text-gray-400">
                              {user?.email}
                            </span>
                          </div>
                        </div>
                        <MobileNavItem to="/orders">
                          {t("orders.title")}
                        </MobileNavItem>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 text-red-500 font-bold text-sm hover:text-red-400 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          {t("user.logout").toUpperCase()}
                        </button>
                      </div>
                    ) : (
                      <Link
                        to="/auth"
                        className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm transition-all text-xs font-bold tracking-widest text-white uppercase justify-center"
                      >
                        <User className="w-4 h-4 text-red-600" />
                        {t("common.login")}
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-sm font-bold tracking-widest hover:text-red-600 transition-colors duration-300 ${
          isActive ? "text-red-600" : "text-white"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function MobileNavItem({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-lg font-bold tracking-widest hover:text-red-600 transition-colors duration-300 uppercase ${
          isActive ? "text-red-600" : "text-white"
        }`
      }
    >
      {children}
    </NavLink>
  );
}
