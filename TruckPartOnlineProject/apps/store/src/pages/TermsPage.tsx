import { Helmet } from "react-helmet-async";
import { Link } from "react-router";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      <Helmet>
        <title>Términos y Condiciones | Tony Truck Parts</title>
        <meta name="description" content="Términos y condiciones de uso de Tony Truck Parts. Consulta las reglas de compra, envío y devoluciones." />
        <link rel="canonical" href="https://tonytruckpart.com/terms" />
      </Helmet>
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="mb-12">
          <span className="text-red-600 font-bold tracking-widest uppercase text-xs mb-4 block">
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-gray-500 text-sm">
            Última actualización: Marzo 2026
          </p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Aceptación de Términos</h2>
            <p>
              Al acceder y utilizar el sitio web de Tony Truck Parts (tonytruckpart.com), usted acepta estar sujeto a estos términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Productos y Precios</h2>
            <p className="mb-3">
              Nos esforzamos por mostrar información precisa sobre nuestros productos, incluyendo descripciones, imágenes y precios. Sin embargo, nos reservamos el derecho de:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
              <li>Corregir errores de precios o descripciones</li>
              <li>Modificar precios sin previo aviso</li>
              <li>Limitar cantidades de pedido</li>
              <li>Cancelar pedidos con precios incorrectos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Pedidos y Pagos</h2>
            <p>
              Al realizar un pedido, usted se compromete a proporcionar información veraz y completa. Los pagos se procesan de forma segura a través de Stripe. Nos reservamos el derecho de rechazar o cancelar pedidos por razones de seguridad o disponibilidad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Envíos</h2>
            <p>
              Los tiempos de envío son estimados y pueden variar según la ubicación y disponibilidad del producto. Tony Truck Parts no se hace responsable por retrasos causados por el servicio de mensajería o eventos fuera de nuestro control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Devoluciones y Reembolsos</h2>
            <p>
              Las devoluciones deben solicitarse dentro de los 30 días posteriores a la recepción del producto. El producto debe estar en su empaque original y sin uso. Los gastos de envío de devolución corren por cuenta del cliente, salvo en casos de producto defectuoso o error de envío.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. Propiedad Intelectual</h2>
            <p>
              Todo el contenido del sitio web, incluyendo textos, imágenes, logotipos y diseños, es propiedad de Tony Truck Parts y está protegido por leyes de propiedad intelectual. Las marcas de camiones mencionadas pertenecen a sus respectivos propietarios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">7. Limitación de Responsabilidad</h2>
            <p>
              Tony Truck Parts no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de nuestros productos o servicios. Nuestra responsabilidad máxima se limita al monto pagado por el producto en cuestión.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">8. Contacto</h2>
            <p>
              Para consultas sobre estos términos, contáctenos en:{" "}
              <a href="mailto:solutionstony20@gmail.com" className="text-red-500 hover:text-red-400 transition-colors">
                solutionstony20@gmail.com
              </a>{" "}
              o al{" "}
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
