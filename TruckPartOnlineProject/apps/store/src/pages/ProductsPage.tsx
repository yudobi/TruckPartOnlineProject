import { useTranslation } from "react-i18next";

export default function ProductsPage() {
  const { t } = useTranslation();

  const products = [
    {
      id: 1,
      name: t("catalog.products.p1"),
      category: t("catalog.filters.maintenance"),
      price: "$24.99",
      code: "FLT-001",
    },
    {
      id: 2,
      name: t("catalog.products.p2"),
      category: t("catalog.filters.safety"),
      price: "$89.99",
      code: "BRK-992",
    },
    {
      id: 3,
      name: t("catalog.products.p3"),
      category: t("catalog.filters.electric"),
      price: "$15.99",
      code: "ELC-334",
    },
    {
      id: 4,
      name: t("catalog.products.p4"),
      category: t("catalog.filters.electric"),
      price: "$159.99",
      code: "PWR-120",
    },
    {
      id: 5,
      name: t("catalog.products.p5"),
      category: t("catalog.filters.chassis"),
      price: "$199.99",
      code: "SUS-550",
    },
    {
      id: 6,
      name: t("catalog.products.p6"),
      category: t("catalog.filters.cooling"),
      price: "$249.99",
      code: "COL-880",
    },
  ];

  return (
    <div className="container mx-auto px-6 py-20">
      <header className="mb-20">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6">
          {t("catalog.title")}
        </h1>
        <div className="h-1 w-20 bg-red-600"></div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-12 border-b border-white/10 pb-8">
        <FilterButton active>{t("catalog.filters.all")}</FilterButton>
        <FilterButton>{t("catalog.filters.maintenance")}</FilterButton>
        <FilterButton>{t("catalog.filters.electric")}</FilterButton>
        <FilterButton>{t("catalog.filters.chassis")}</FilterButton>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  name,
  category,
  price,
  code,
}: {
  name: string;
  category: string;
  price: string;
  code: string;
}) {
  return (
    <div className="group relative bg-zinc-900/30 border border-white/10 hover:border-red-600/50 transition-all duration-500 overflow-hidden">
      {/* Image Placeholder */}
      <div className="aspect-[4/3] bg-zinc-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
        <span className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">
          IMG
        </span>
      </div>

      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-bold text-red-600 tracking-widest">
            {category}
          </span>
          <span className="text-xs text-gray-600 font-mono">{code}</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-6 group-hover:text-red-500 transition-colors">
          {name}
        </h3>

        <div className="flex justify-between items-end border-t border-white/5 pt-6">
          <span className="text-2xl font-light text-white">{price}</span>
          <button className="w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors duration-300">
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={`px-6 py-2 text-sm font-bold tracking-wider transition-all border ${
        active
          ? "bg-white text-black border-white"
          : "bg-transparent text-gray-400 border-transparent hover:border-white/20 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
