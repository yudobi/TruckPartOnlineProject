import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, ArrowRight, Phone, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { loginSchema, registerSchema } from "@lib/validations";
import { useFormValidation } from "@hooks/useFormValidation";
import authService from "@/services/auth";

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Débil", color: "bg-red-500" };
  if (score <= 3) return { score, label: "Media", color: "bg-yellow-500" };
  return { score, label: "Fuerte", color: "bg-green-500" };
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
  const [loading, setLoading] = useState(false);

  const loginValidation = useFormValidation(loginSchema);
  const registerValidation = useFormValidation(registerSchema);

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      const valid = loginValidation.validate({
        email: formData.email,
        password: formData.password,
      });
      if (!valid) return;
    } else {
      const valid = registerValidation.validate({
        username: formData.username,
        email: formData.email,
        phone_number: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      if (!valid) return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login({
          email: formData.email,
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
        // Redirigir a la página de éxito con el email
        navigate("/registration-success", { state: { email: formData.email } });
      }
    } catch (err: unknown) {
      console.error(err);

      // Si es un error de login, verificar si la cuenta existe pero no está verificada
      if (isLogin) {
        try {
          const accountStatus = await authService.checkAccountStatus(formData.email);

          if (accountStatus.exists && !accountStatus.is_active) {
            toast.error("Tu cuenta no ha sido verificada. Revisa tu correo o reenvía la verificación.");
            navigate("/resend-verification", { state: { email: formData.email } });
            return;
          }
        } catch (statusError) {
          console.error("Error checking account status:", statusError);
        }
      }

      const errorMessage = isLogin
        ? (err instanceof Error ? err.message : t("auth.login.error_message"))
        : (err instanceof Error ? err.message : t("auth.register.error_message"));

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    loginValidation.clearErrors();
    registerValidation.clearErrors();
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

  const activeErrors = isLogin
    ? loginValidation.errors
    : registerValidation.errors;
  const clearFieldError = isLogin
    ? loginValidation.clearFieldError
    : registerValidation.clearFieldError;

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center px-6">
      <Helmet>
        <title>{isLogin ? "Iniciar Sesión" : "Crear Cuenta"} | Tony Truck Parts</title>
        <meta name="description" content={isLogin ? "Inicia sesión en tu cuenta de Tony Truck Parts para gestionar tus pedidos de refacciones." : "Crea tu cuenta en Tony Truck Parts y accede a las mejores refacciones para camiones."} />
        <meta name="robots" content="noindex" />
      </Helmet>
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
                        activeErrors.username ? "border-red-500" : ""
                      }`}
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={(e) => {
                        setFormData({ ...formData, username: e.target.value });
                        clearFieldError("username");
                      }}
                    />
                  </div>
                  {activeErrors.username && (
                    <p className="text-red-400 text-xs mt-1">
                      {activeErrors.username}
                    </p>
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
                        activeErrors.email ? "border-red-500" : ""
                      }`}
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        clearFieldError("email");
                      }}
                    />
                  </div>
                  {activeErrors.email && (
                    <p className="text-red-400 text-xs mt-1">
                      {activeErrors.email}
                    </p>
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
                        activeErrors.phone_number ? "border-red-500" : ""
                      }`}
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        clearFieldError("phone_number");
                      }}
                    />
                  </div>
                  {activeErrors.phone_number && (
                    <p className="text-red-400 text-xs mt-1">
                      {activeErrors.phone_number}
                    </p>
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
                      className="pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600"
                      placeholder="123 Main St, City"
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                  {t("auth.login.email")} *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    className={`pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600 ${
                      activeErrors.email ? "border-red-500" : ""
                    }`}
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      clearFieldError("email");
                    }}
                  />
                </div>
                {activeErrors.email && (
                  <p className="text-red-400 text-xs mt-1">
                    {activeErrors.email}
                  </p>
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
                    onClick={() => navigate("/forgot-password")}
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
                    activeErrors.password ? "border-red-500" : ""
                  }`}
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    clearFieldError("password");
                  }}
                />
              </div>
              {activeErrors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {activeErrors.password}
                </p>
              )}
              {!isLogin && formData.password && (
                <div className="mt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i <= strength.score
                            ? strength.color
                            : "bg-zinc-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${strength.color.replace("bg-", "text-")}`}
                  >
                    {strength.label}
                  </p>
                </div>
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
                      activeErrors.confirmPassword ? "border-red-500" : ""
                    }`}
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      });
                      clearFieldError("confirmPassword");
                    }}
                  />
                </div>
                {activeErrors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    {activeErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-white text-black hover:bg-red-600 hover:text-white text-sm font-black tracking-widest transition-all duration-300 group mt-4 disabled:opacity-50"
            >
              {loading
                ? <Loader2 className="animate-spin h-4 w-4" />
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
