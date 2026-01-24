import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link
              to="/"
              className="inline-block text-2xl font-bold tracking-tighter"
            >
              TRUCK<span className="text-red-600">PART</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {t("footer.desc")}
            </p>
          </div>

          {/* Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-red-600 tracking-widest uppercase">
              {t("footer.explore")}
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <Link
                  to="/products"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.catalog")}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.history")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.support")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-red-600 tracking-widest uppercase">
              {t("footer.contact")}
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                info@truckpart.com
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                +1 (555) 999-0000
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                123 Industrial Park, NY
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p>
            © {currentYear} TruckPart Online. {t("footer.rights")}
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              {t("footer.privacy")}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {t("footer.terms")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
