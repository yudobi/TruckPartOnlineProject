import { Helmet } from "react-helmet-async";
import { Link } from "react-router";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      <Helmet>
        <title>Política de Privacidad | Tony Truck Parts</title>
        <meta name="description" content="Política de privacidad de Tony Truck Parts. Conoce cómo protegemos tu información personal." />
        <link rel="canonical" href="https://tonytruckpart.com/privacy" />
      </Helmet>
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="mb-12">
          <span className="text-red-600 font-bold tracking-widest uppercase text-xs mb-4 block">
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Política de Privacidad
          </h1>
          <p className="text-gray-500 text-sm">
            Última actualización: Marzo 2026
          </p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Información que Recopilamos</h2>
            <p className="mb-3">
              En Tony Truck Parts, recopilamos la información que usted nos proporciona directamente al crear una cuenta, realizar un pedido o contactarnos. Esto incluye:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>Nombre completo y nombre de usuario</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Dirección de envío</li>
              <li>Información de pago (procesada de forma segura por Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Uso de la Información</h2>
            <p>
              Utilizamos su información personal para procesar pedidos, enviar confirmaciones, brindar soporte al cliente, y mejorar nuestros servicios. No vendemos ni compartimos su información personal con terceros para fines de marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Seguridad de Datos</h2>
            <p>
              Implementamos medidas de seguridad estándar de la industria para proteger su información personal. Los pagos son procesados de manera segura a través de Stripe, que cumple con los estándares PCI DSS. No almacenamos números de tarjetas de crédito en nuestros servidores.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Cookies</h2>
            <p>
              Utilizamos cookies esenciales para mantener su sesión activa y recordar sus preferencias de idioma. No utilizamos cookies de rastreo publicitario.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Sus Derechos</h2>
            <p>
              Usted tiene derecho a acceder, corregir o eliminar su información personal en cualquier momento desde su perfil de usuario. También puede contactarnos directamente para ejercer estos derechos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. Contacto</h2>
            <p>
              Si tiene preguntas sobre esta política de privacidad, puede contactarnos en:{" "}
              <a href="mailto:solutionstony20@gmail.com" className="text-red-500 hover:text-red-400 transition-colors">
                solutionstony20@gmail.com
              </a>{" "}
              o llamarnos al{" "}
              <a href="tel:+13213169859" className="text-red-500 hover:text-red-400 transition-colors">
                +1 (321) 316-9859
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <Link to="/" className="text-red-500 hover:text-red-400 text-sm font-bold tracking-widest uppercase transition-colors">
            ← Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
