import { useState } from "react";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router";
import { forgotPasswordSchema } from "@lib/validations";
import { useFormValidation } from "@hooks/useFormValidation";
import authService from "@/services/auth";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = useFormValidation(forgotPasswordSchema);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const valid = validation.validate({ email });
    if (!valid) return;

    setLoading(true);
    try {
      await authService.passwordResetRequest(email);
      setSent(true);
    } catch {
      setError("Error al enviar el correo. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center px-6">
      <Helmet>
        <title>Recuperar Contraseña | Tony Truck Parts</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full mb-6 text-red-500 text-xs font-bold tracking-widest uppercase">
            Recuperar Contraseña
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
            {sent ? "Correo Enviado" : "¿Olvidaste tu contraseña?"}
          </h1>
          <p className="text-gray-400">
            {sent
              ? "Revisa tu bandeja de entrada"
              : "Ingresa tu email y te enviaremos un enlace para restablecerla"}
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-red-600 to-red-900 rounded-lg blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

          <div className="relative bg-zinc-950 p-8 md:p-10 border border-white/5 rounded-sm">
            {sent ? (
              <div className="flex flex-col items-center text-center space-y-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white">
                    Revisa tu correo
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Si existe una cuenta asociada a{" "}
                    <span className="font-semibold text-white">{email}</span>,
                    recibirás un enlace para restablecer tu contraseña.
                  </p>
                  <p className="text-gray-500 text-xs mt-4">
                    No olvides revisar tu carpeta de spam.
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/auth")}
                  className="w-full h-12 bg-white text-black hover:bg-red-600 hover:text-white text-sm font-black tracking-widest transition-all duration-300"
                >
                  Volver al Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      className={`pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600 ${
                        validation.errors.email ? "border-red-500" : ""
                      }`}
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        validation.clearFieldError("email");
                      }}
                    />
                  </div>
                  {validation.errors.email && (
                    <p className="text-red-400 text-xs mt-1">
                      {validation.errors.email}
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
                  className="w-full h-14 bg-white text-black hover:bg-red-600 hover:text-white text-sm font-black tracking-widest transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Enviar enlace"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate("/auth")}
            className="text-sm text-gray-500 hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Login
          </button>
        </div>
      </div>
    </div>
  );
}
