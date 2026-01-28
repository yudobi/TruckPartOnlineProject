import { Link } from "react-router";
import { useTranslation, Trans } from "react-i18next";
import heroBg from "../assets/peterbilt-hero.png";

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden border-b border-white/10">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="Peterbilt Truck Premium"
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>
        </div>

        {/* Abstract Red Shape - Optional specifically if requested, but better without it for clean image look, keeping a subtle glow maybe */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-3xl z-0 mix-blend-overlay"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="inline-block py-1 px-3 border border-red-600/30 rounded-full text-red-500 text-xs tracking-[0.2em] font-bold mb-8 uppercase">
            {t("home.badge")}
          </span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-tight">
            <Trans i18nKey="home.heroTitle" />
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 font-light">
            {t("home.heroDesc")}
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link
              to="/products"
              className="px-10 py-5 bg-red-600 hover:bg-red-700 text-white font-bold tracking-wider transition-all hover:scale-105"
            >
              {t("home.viewCatalog")}
            </Link>
            <Link
              to="/contact"
              className="px-10 py-5 border border-white/20 hover:border-white hover:bg-white/5 text-white font-bold tracking-wider transition-all"
            >
              {t("home.contactUs")}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Stripe */}
      <section className="border-b border-white/10 bg-zinc-900/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <FeatureItem
              number="01"
              title={t("home.features.f1Title")}
              desc={t("home.features.f1Desc")}
            />
            <FeatureItem
              number="02"
              title={t("home.features.f2Title")}
              desc={t("home.features.f2Desc")}
            />
            <FeatureItem
              number="03"
              title={t("home.features.f3Title")}
              desc={t("home.features.f3Desc")}
            />
          </div>
        </div>
      </section>

      {/* Modern Grid Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight">
                <Trans i18nKey="home.engineeringTitle" />
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                {t("home.engineeringDesc")}
              </p>
              <ul className="space-y-4">
                <ListItem>{t("home.listItems.l1")}</ListItem>
                <ListItem>{t("home.listItems.l2")}</ListItem>
                <ListItem>{t("home.listItems.l3")}</ListItem>
              </ul>
            </div>

            <div className="relative">
              <div className="aspect-square bg-linear-to-br from-zinc-800 to-black border border-white/10 rounded-2xl p-8 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-red-600/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <div className="text-center relative z-10">
                  <div className="text-9xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    ⚙️
                  </div>
                  <div className="text-xl font-bold tracking-widest text-gray-500 group-hover:text-white transition-colors">
                    {t("home.systems")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-24 bg-black border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-red-600 font-bold tracking-widest text-sm uppercase">
              {t("home.brandsBadge")}
            </span>
            <h2 className="text-3xl md:text-5xl font-black mt-4 text-white uppercase tracking-tighter">
              {t("home.brandsTitleLeading")}{" "}
              <span className="text-zinc-600">
                {t("home.brandsTitleTrailing")}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <BrandCard name="Kenworth" logo="/logo/kenworth_logo.svg" />
            <BrandCard name="Peterbilt" logo="/logo/peterbilt_logo.svg" />
            <BrandCard name="Freightliner" logo="/logo/freightliner_logo.svg" />
            <BrandCard name="Mack" logo="/logo/mack_logo.svg" />
            <BrandCard name="International" logo="/logo/international_logo.svg" />
            <BrandCard name="Western Star" logo="/logo/western_logo.svg" />
            <BrandCard name="Volvo" logo="/logo/volvo_logo.svg" />
            <BrandCard name="Caterpillar" logo="/logo/caterpillar_logo.svg" />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="py-12 px-6 group hover:bg-white/5 transition-colors cursor-default">
      <span className="text-red-600 font-mono text-sm mb-4 block">
        {number}
      </span>
      <h3 className="text-xl font-bold mb-2 tracking-wide text-white">
        {title}
      </h3>
      <p className="text-gray-500 text-sm group-hover:text-gray-400 transition-colors">
        {desc}
      </p>
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center space-x-4 text-gray-300">
      <span className="w-2 h-2 bg-red-600"></span>
      <span>{children}</span>
    </li>
  );
}

function BrandCard({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="group relative h-32 md:h-40 bg-zinc-900/50 border border-white/5 hover:border-red-600/50 hover:bg-zinc-900 transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-red-900/10 p-8">
      <div className="absolute inset-x-0 bottom-0 h-1 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      <img
        src={logo}
        alt={name}
        className="w-full h-full object-contain filter grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
      />
    </div>
  );
}
