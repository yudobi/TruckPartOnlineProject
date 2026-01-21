export default function ContactPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left: Info */}
      <div className="bg-zinc-900 p-12 md:p-24 flex flex-col justify-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-black text-white mb-8 tracking-tighter">
            CONTACTO
          </h1>
          <p className="text-gray-400 mb-12 text-lg">
            Estamos listos para optimizar tu flota. Cuéntanos qué necesitas.
          </p>

          <div className="space-y-8">
            <ContactItem
              label="OFICINA CENTRAL"
              value="123 Industrial Ave, NY 10001"
            />
            <ContactItem label="CORREO" value="enterprise@truckpart.com" />
            <ContactItem label="TELÉFONO" value="+1 (555) 000-1122" />
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="bg-black p-12 md:p-24 flex items-center">
        <form className="w-full max-w-md space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
              Nombre
            </label>
            <input
              type="text"
              className="w-full bg-zinc-900 border-b-2 border-zinc-800 focus:border-red-600 text-white p-4 outline-none transition-colors"
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
              Email
            </label>
            <input
              type="email"
              className="w-full bg-zinc-900 border-b-2 border-zinc-800 focus:border-red-600 text-white p-4 outline-none transition-colors"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
              Mensaje
            </label>
            <textarea
              rows={4}
              className="w-full bg-zinc-900 border-b-2 border-zinc-800 focus:border-red-600 text-white p-4 outline-none transition-colors resize-none"
              placeholder="Detalles de tu consulta..."
            />
          </div>

          <button className="w-full bg-white text-black font-bold py-4 px-8 mt-4 hover:bg-red-600 hover:text-white transition-all tracking-wider uppercase">
            Enviar Mensaje
          </button>
        </form>
      </div>
    </div>
  );
}

function ContactItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-red-600 tracking-widest mb-1">
        {label}
      </h3>
      <p className="text-white text-xl font-light">{value}</p>
    </div>
  );
}
