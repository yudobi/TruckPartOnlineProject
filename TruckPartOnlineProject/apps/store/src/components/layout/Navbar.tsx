import { Link, NavLink } from "react-router";
import { ChevronDown, User, LogOut, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import CartSidebar from "@/components/cart/CartSidebar";

const CATEGORIES = [
  {
    name: "Motor",
    subcategories: ["Filtros", "Aceite", "Empacaduras", "Pistones"],
  },
  {
    name: "Frenos",
    subcategories: ["Pastillas", "Discos", "Tambores", "Liquido de Freno"],
  },
  {
    name: "Suspensión",
    subcategories: ["Amortiguadores", "Ballestas", "Bujes"],
  },
  {
    name: "Eléctrico",
    subcategories: ["Baterías", "Alternadores", "Faros", "Cables"],
  },
];

export default function Navbar() {
  const { t } = useTranslation();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="px-1 h-20 bg-red-600 flex items-center justify-center ">
              <span className="text-xl font-bold text-black">TONY</span>
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white">
              TRUCK<span className="text-red-600">PART</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavItem to="/">{t("nav.home").toUpperCase()}</NavItem>
            <NavItem to="/products">{t("nav.catalog").toUpperCase()}</NavItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm font-bold tracking-widest hover:text-red-600 transition-colors duration-300 text-white focus:outline-none flex items-center gap-1 cursor-pointer">
                {t("nav.search").toUpperCase()}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-black/90 border-white/10 text-white backdrop-blur-xl">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-gray-300">
                    {t("nav.searchCategory")}
                  </DropdownMenuLabel>
                  {CATEGORIES.map((category) => (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        {category.name}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {category.subcategories.map((subcategory) => (
                            <DropdownMenuItem key={subcategory}>
                              {subcategory}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <NavItem to="/about">{t("nav.about").toUpperCase()}</NavItem>
            <NavItem to="/contact">{t("nav.contact").toUpperCase()}</NavItem>

            <div className="h-6 w-px bg-white/20 mx-2" />

            <LanguageSwitcher />

            <div className="h-6 w-px bg-white/20 mx-2" />

            <CartSidebar />

            <div className="h-6 w-px bg-white/20 mx-2" />

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
                    Jorge
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
                      Jorge User
                    </p>
                    <p className="text-xs leading-none text-gray-400">
                      jorge@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuItem className="cursor-pointer text-gray-300 focus:text-white focus:bg-white/10 py-2.5">
                    <Settings className="mr-3 h-4 w-4 text-red-500" />
                    <span>{t("user.profile")}</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-2 bg-white/10" />

                <DropdownMenuItem className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-950/20 py-2.5">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>{t("user.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <LanguageSwitcher />
            <CartSidebar />
            <button className="text-white hover:text-red-600 transition-colors">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
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
