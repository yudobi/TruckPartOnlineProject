import { Link } from "react-router";

export default function Footer() {
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
              Líderes en distribución de partes para camiones. Ingeniería de
              precisión y durabilidad garantizada para mantener tu flota en
              movimiento.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-red-600 tracking-widest uppercase">
              Explorar
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <Link
                  to="/products"
                  className="hover:text-white transition-colors"
                >
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors"
                >
                  Nuestra Historia
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Soporte Técnico
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-red-600 tracking-widest uppercase">
              Contacto
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
            © {currentYear} TruckPart Online. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacidad
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Términos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
