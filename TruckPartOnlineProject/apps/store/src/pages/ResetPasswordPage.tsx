import { useState } from "react";
import { Lock, Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useNavigate } from "react-router";
import { resetPasswordSchema } from "@lib/validations";
import { useFormValidation } from "@hooks/useFormValidation";
import authService from "@/services/auth";
import { toast } from "sonner";

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

export default function ResetPasswordPage() {
  const { uid, token, requestId } = useParams<{
    uid: string;
    token: string;
    requestId: string;
  }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    new_password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"form" | "success" | "error">("form");
  const [error, setError] = useState<string | null>(null);

  const validation = useFormValidation(resetPasswordSchema);
  const strength = getPasswordStrength(formData.new_password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const valid = validation.validate(formData);
    if (!valid) return;

    if (!uid || !token || !requestId) {
      setError("Link inválido. Solicita un nuevo enlace de recuperación.");
      return;
    }

    setLoading(true);
    try {
      await authService.passwordResetConfirm(uid, token, requestId, formData.new_password);
      setStatus("success");
      toast.success("Contraseña actualizada correctamente");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string | string[] } } };
      const serverError = axiosError?.response?.data?.error;

      if (Array.isArray(serverError)) {
        setError(serverError.join(". "));
      } else if (typeof serverError === "string") {
        setError(serverError);
      } else {
        setError("Error al restablecer la contraseña. El enlace puede haber expirado.");
      }
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token || !requestId) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-red-600 to-red-900 rounded-lg blur opacity-10"></div>
            <div className="relative bg-zinc-950 p-8 md:p-10 border border-white/5 rounded-sm">
              <div className="flex flex-col items-center text-center space-y-6">
                <XCircle className="h-16 w-16 text-red-500" />
                <h2 className="text-2xl font-bold text-white">Link Inválido</h2>
                <p className="text-gray-400">
                  El enlace de recuperación no es válido. Solicita uno nuevo.
                </p>
                <Button
                  onClick={() => navigate("/forgot-password")}
                  className="w-full h-12 bg-white text-black hover:bg-red-600 hover:text-white text-sm font-black tracking-widest transition-all duration-300"
                >
                  Solicitar nuevo enlace
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center px-6">
      <Helmet>
        <title>Restablecer Contraseña | Tony Truck Parts</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full mb-6 text-red-500 text-xs font-bold tracking-widest uppercase">
            Nueva Contraseña
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
            {status === "success" ? "¡Listo!" : "Restablecer Contraseña"}
          </h1>
          <p className="text-gray-400">
            {status === "success"
              ? "Tu contraseña ha sido actualizada"
              : "Ingresa tu nueva contraseña"}
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-red-600 to-red-900 rounded-lg blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

          <div className="relative bg-zinc-950 p-8 md:p-10 border border-white/5 rounded-sm">
            {status === "success" ? (
              <div className="flex flex-col items-center text-center space-y-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white">
                    Contraseña Actualizada
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Ya puedes iniciar sesión con tu nueva contraseña.
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/auth")}
                  className="w-full h-12 bg-white text-black hover:bg-red-600 hover:text-white text-sm font-black tracking-widest transition-all duration-300 group"
                >
                  Iniciar Sesión
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            ) : status === "error" ? (
              <div className="flex flex-col items-center text-center space-y-6">
                <XCircle className="h-16 w-16 text-red-500" />
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white">Error</h2>
                  <p className="text-gray-400 text-sm">{error}</p>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <Button
                    onClick={() => {
                      setStatus("form");
                      setError(null);
                    }}
                    className="w-full h-12 bg-white text-black hover:bg-red-600 hover:text-white text-sm font-black tracking-widest transition-all duration-300"
                  >
                    Intentar de nuevo
                  </Button>
                  <Button
                    onClick={() => navigate("/forgot-password")}
                    variant="outline"
                    className="w-full h-12 border-white/10 text-white hover:bg-white/5 text-sm font-black tracking-widest transition-all duration-300"
                  >
                    Solicitar nuevo enlace
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                    Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      className={`pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600 ${
                        validation.errors.new_password ? "border-red-500" : ""
                      }`}
                      type="password"
                      placeholder="••••••••"
                      value={formData.new_password}
                      onChange={(e) => {
                        setFormData({ ...formData, new_password: e.target.value });
                        validation.clearFieldError("new_password");
                      }}
                    />
                  </div>
                  {validation.errors.new_password && (
                    <p className="text-red-400 text-xs mt-1">
                      {validation.errors.new_password}
                    </p>
                  )}
                  {formData.new_password && (
                    <div className="mt-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full ${
                              i <= strength.score ? strength.color : "bg-zinc-700"
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

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      className={`pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600 ${
                        validation.errors.confirmPassword ? "border-red-500" : ""
                      }`}
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        validation.clearFieldError("confirmPassword");
                      }}
                    />
                  </div>
                  {validation.errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">
                      {validation.errors.confirmPassword}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-sm text-red-500 text-xs font-bold text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-white text-black hover:bg-red-600 hover:text-white text-sm font-black tracking-widest transition-all duration-300 disabled:opacity-50 group"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <>
                      Restablecer Contraseña
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
