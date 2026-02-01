import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";

export default function AuthPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login({
          username: formData.username,
          password: formData.password,
        });
        navigate("/");
      } else {
        // Lógica de registro (no implementada aún en el servicio)
        console.log("Registering:", formData);
        setIsLogin(true);
      }
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : t("auth.login.error_message") || "Error al iniciar sesión",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full mb-6 text-red-500 text-xs font-bold tracking-widest uppercase">
            {isLogin ? t("auth.login.badge") : t("auth.register.badge")}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
            {isLogin ? t("auth.login.title") : t("auth.register.title")}
          </h1>
          <p className="text-gray-400">
            {isLogin ? t("auth.login.subtitle") : t("auth.register.subtitle")}
          </p>
        </div>

        <div className="relative group">
          {/* Decorative background blur */}
          <div className="absolute -inset-1 bg-linear-to-r from-red-600 to-red-900 rounded-lg blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>

          <form
            className="relative space-y-6 bg-zinc-950 p-8 md:p-10 border border-white/5 rounded-sm"
            onSubmit={handleSubmit}
          >
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                  {t("auth.register.name")}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    className="pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                {t("auth.login.email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  className="pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600"
                  type="text"
                  placeholder="Username or Email"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                  {t("auth.login.password")}
                </label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-white transition-colors"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  className="pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                  {t("auth.register.confirmPassword")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    className="pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-sm text-red-500 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-white text-black hover:bg-red-600 hover:text-white text-sm font-black tracking-widest transition-all duration-300 group mt-4 disabled:opacity-50"
            >
              {loading
                ? "..."
                : isLogin
                  ? t("auth.login.submit")
                  : t("auth.register.submit")}
              {!loading && (
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </form>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            {isLogin
              ? t("auth.login.noAccount")
              : t("auth.register.haveAccount")}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-white font-bold hover:text-red-600 transition-colors border-b border-white/10 hover:border-red-600 pb-0.5 ml-1"
            >
              {isLogin ? t("auth.login.register") : t("auth.register.login")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
