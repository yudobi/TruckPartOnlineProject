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

          <div className="space-y-8 mb-12">
            <ContactItem
              label="OFICINA CENTRAL"
              value="1040 Alameda Dr, Longwood, FL 32750"
            />
            <ContactItem label="CORREO" value="solutionstony20@gmail.com" />
            <ContactItem label="TELÉFONO" value="+1 (321) 316-9859" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-10">
            <a
              href="tel:+13213169859"
              className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-red-600 text-white px-5 py-3 rounded-full text-sm font-bold tracking-wider transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Llamar
            </a>
            <a
              href="https://wa.me/13213169859"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-green-600 text-white px-5 py-3 rounded-full text-sm font-bold tracking-wider transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
            <a
              href="mailto:solutionstony20@gmail.com"
              className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-red-600 text-white px-5 py-3 rounded-full text-sm font-bold tracking-wider transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Email
            </a>
          </div>

          {/* Social Media */}
          <div className="flex gap-3">
            <a
              href="https://www.tiktok.com/@toni_truckparts0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-red-600 text-white px-5 py-3 rounded-full text-sm font-bold tracking-wider transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.28 8.28 0 0 0 4.76 1.5V6.8a4.83 4.83 0 0 1-1-.11z" />
              </svg>
              TikTok
            </a>
            <a
              href="https://www.facebook.com/share/1bzbWvadhB/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-red-600 text-white px-5 py-3 rounded-full text-sm font-bold tracking-wider transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </a>
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
