import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-[12rem] font-black text-zinc-900 leading-none select-none">
        404
      </h1>
      <div className="relative -top-16">
        <h2 className="text-4xl font-bold text-white mb-4">
          Página Extraviada
        </h2>
        <p className="text-gray-500 mb-8">
          La ruta especificada no existe en nuestro sistema.
        </p>
        <Link
          to="/"
          className="inline-block border border-red-600 text-red-600 px-8 py-3 hover:bg-red-600 hover:text-white transition-colors font-bold tracking-widest uppercase"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
