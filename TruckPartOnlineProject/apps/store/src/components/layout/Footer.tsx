import { memo } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

const Footer = memo(function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white border-t border-white/10 pt-16 pb-8" role="contentinfo">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link
              to="/"
              className="inline-block text-2xl font-bold tracking-tighter"
            >
              <img className="h-20 bg-gray-100" height={100} width={200} src="/logo/full-logo.svg" alt="tony truck part" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {t("footer.desc")}
            </p>

            {/* Social & Action Icons */}
            <div className="flex gap-3 pt-2">
              <a
                href="tel:+13213169859"
                className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
                aria-label="Llamar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </a>
              <a
                href="https://wa.me/13213169859"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-green-600 flex items-center justify-center text-white transition-colors"
                aria-label="WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@toni_truckparts0"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
                aria-label="TikTok"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.28 8.28 0 0 0 4.76 1.5V6.8a4.83 4.83 0 0 1-1-.11z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/share/1bzbWvadhB/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <nav aria-label={t("footer.explore")}>
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
          </nav>

          {/* Contact */}
          <div className="space-y-6" aria-label={t("footer.contact")}>
            <h4 className="text-xs font-bold text-red-600 tracking-widest uppercase">
              {t("footer.contact")}
            </h4>
            <ul className="space-y-4 text-sm text-gray-400" aria-label="Información de contacto">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0"></span>
                <a href="mailto:solutionstony20@gmail.com" className="hover:text-white transition-colors">
                  solutionstony20@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0"></span>
                <a href="tel:+13213169859" className="hover:text-white transition-colors">
                  +1 (321) 316-9859
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0"></span>
                1040 Alameda Dr, Longwood, FL 32750
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p>
            © {currentYear} TruckPart Online. {t("footer.rights")}
          </p>
          <nav aria-label="Legal">
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              {t("footer.terms")}
            </Link>
          </div>
          </nav>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
