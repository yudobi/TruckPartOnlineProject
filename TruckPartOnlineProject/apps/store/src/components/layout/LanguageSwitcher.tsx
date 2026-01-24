import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.split("-")[0];

  const setLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center p-1 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full relative w-32 h-10 select-none shadow-2xl overflow-hidden group">
      {/* Sliding Background / Highlight */}
      <div
        className={cn(
          "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-red-600 rounded-full transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-[0_0_15px_rgba(220,38,38,0.5)]",
          currentLanguage === "es" ? "left-1" : "left-[calc(50%+1px)]",
        )}
      />

      {/* Spanish Option */}
      <button
        onClick={() => setLanguage("es")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 z-10 transition-all duration-300 outline-none",
          currentLanguage === "es"
            ? "text-white scale-105"
            : "text-gray-500 hover:text-gray-300",
        )}
      >
        <span className="text-sm filter drop-shadow-sm">🇪🇸</span>
        <span className="text-[11px] font-black tracking-widest">ES</span>
      </button>

      {/* English Option */}
      <button
        onClick={() => setLanguage("en")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 z-10 transition-all duration-300 outline-none",
          currentLanguage === "en"
            ? "text-white scale-105"
            : "text-gray-500 hover:text-gray-300",
        )}
      >
        <span className="text-sm filter drop-shadow-sm">🇺🇸</span>
        <span className="text-[11px] font-black tracking-widest">EN</span>
      </button>
    </div>
  );
}
