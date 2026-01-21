export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-4xl">
        <span className="text-red-600 font-bold tracking-widest uppercase mb-4 block">
          Nuestra Historia
        </span>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-12 leading-tight">
          REDEFINIENDO LA <br />
          CADENA DE SUMINISTRO.
        </h1>

        <div className="grid md:grid-cols-2 gap-16 mb-24">
          <div>
            <p className="text-xl text-gray-300 leading-relaxed font-light">
              TruckPart no es solo un distribuidor. Somos el socio estratégico
              que garantiza que tus vehículos estén donde deben estar: en la
              carretera. Desde 2005, hemos implementado estándares militares en
              nuestra logística comercial.
            </p>
          </div>
          <div className="text-gray-500 space-y-4 font-mono text-sm border-l border-red-600 pl-6">
            <p>FUNDADA: 2005</p>
            <p>SEDE: NEW YORK</p>
            <p>ALCANCE: GLOBAL</p>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-px bg-white/10 border border-white/10">
          <ValueBox
            title="PRECISIÓN"
            desc="Cero margen de error en compatibilidad."
          />
          <ValueBox title="VELOCIDAD" desc="Logística optimizada al minuto." />
          <ValueBox
            title="RESISTENCIA"
            desc="Componentes probados bajo estrés."
          />
        </div>
      </div>
    </div>
  );
}

function ValueBox({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-black p-12 hover:bg-zinc-900 transition-colors duration-500">
      <h3 className="text-xl font-bold text-white mb-4 tracking-wider">
        {title}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
