import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, ArrowRight, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";

interface ValidationErrors {
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
  confirmPassword?: string;
}

export default function AuthPage() {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    address: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!isLogin) {
      // Validar username
      if (!formData.username.trim()) {
        newErrors.username = t("auth.register.validation.username_required");
      } else if (formData.username.length < 3) {
        newErrors.username = t("auth.register.validation.username_min");
      }

      // Validar email
      if (!formData.email.trim()) {
        newErrors.email = t("auth.register.validation.email_required");
      } else if (!validateEmail(formData.email)) {
        newErrors.email = t("auth.register.validation.email_invalid");
      }

      // Validar teléfono
      if (!formData.phone.trim()) {
        newErrors.phone = t("auth.register.validation.phone_required");
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = t("auth.register.validation.phone_invalid");
      }

      // Validar dirección
      if (!formData.address.trim()) {
        newErrors.address = t("auth.register.validation.address_required");
      } else if (formData.address.length < 5) {
        newErrors.address = t("auth.register.validation.address_min");
      }

      // Validar contraseña
      if (!formData.password) {
        newErrors.password = t("auth.register.validation.password_required");
      } else if (formData.password.length < 8) {
        newErrors.password = t("auth.register.validation.password_min");
      }

      // Validar confirmación de contraseña
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t("auth.register.validation.passwords_match");
      }
    } else {
      // Validar login
      if (!formData.username.trim()) {
        newErrors.username = t("auth.login.error_message");
      }
      if (!formData.password) {
        newErrors.password = t("auth.login.error_message");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login({
          username: formData.username,
          password: formData.password,
        });
        navigate("/");
      } else {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone,
          address: formData.address,
        });
        navigate("/");
      }
    } catch (err: unknown) {
      console.error(err);
      let errorMessage = isLogin
        ? t("auth.login.error_message")
        : t("auth.register.error_message");
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setErrors({});
    setFormData({
      username: "",
      password: "",
      email: "",
      phone: "",
      address: "",
      confirmPassword: "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              <>
                {/* Username */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                    {t("auth.register.username")} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      className={`pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600 ${
                        errors.username ? "border-red-500" : ""
                      }`}
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-xs">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                    {t("auth.register.email")} *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      className={`pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600 ${
                        errors.email ? "border-red-500" : ""
                      }`}
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs">{errors.email}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                    {t("auth.register.phone")} *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      className={`pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600 ${
                        errors.phone ? "border-red-500" : ""
                      }`}
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs">{errors.phone}</p>
                  )}
                </div>

                {/* Dirección */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                    {t("auth.register.address")} *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      className={`pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600 ${
                        errors.address ? "border-red-500" : ""
                      }`}
                      placeholder="123 Main St, City"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                  {errors.address && (
                    <p className="text-red-500 text-xs">{errors.address}</p>
                  )}
                </div>
              </>
            )}

            {isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                  {t("auth.login.username")} *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    className={`pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600 ${
                      errors.username ? "border-red-500" : ""
                    }`}
                    type="text"
                    placeholder={t("auth.login.username")}
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 text-xs">{errors.username}</p>
                )}
              </div>
            )}

            {/* Contraseña */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                  {t("auth.login.password")} *
                </label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-white transition-colors"
                  >
                    {t("auth.login.forgot")}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  className={`pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                  {t("auth.register.confirmPassword")} *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    className={`pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600 ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
                )}
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
              onClick={toggleMode}
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
