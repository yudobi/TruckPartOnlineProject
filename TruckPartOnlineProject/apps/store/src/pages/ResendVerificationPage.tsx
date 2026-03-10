import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import authService from "@/services/auth";
import { toast } from "sonner";

export default function ResendVerificationPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    setLoading(true);

    try {
      await authService.resendVerification(email);
      setSuccess(true);
      toast.success("Email de verificación enviado");
    } catch (err) {
      console.error(err);
      setError("Error al enviar el email. Verifica que el correo sea correcto.");
      toast.error("Error al enviar el email de verificación");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-block px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full mb-6 text-red-500 text-xs font-bold tracking-widest uppercase">
              Email Enviado
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-red-600 to-red-900 rounded-lg blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

            <div className="relative bg-zinc-950 p-8 md:p-10 border border-white/5 rounded-sm">
              <div className="flex flex-col items-center text-center space-y-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h2 className="text-2xl font-bold text-white">
                  ¡Email Enviado!
                </h2>
                <p className="text-gray-400">
                  Hemos enviado un nuevo email de verificación a{" "}
                  <span className="text-white font-semibold">{email}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Por favor revisa tu bandeja de entrada y haz clic en el enlace
                  de verificación. Si no lo encuentras, revisa tu carpeta de spam.
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="w-full h-12 bg-white text-black hover:bg-red-600 hover:text-white text-sm font-black tracking-widest transition-all duration-300"
                >
                  Volver al Inicio
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
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full mb-6 text-red-500 text-xs font-bold tracking-widest uppercase">
            Reenviar Verificación
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
            Verificar Email
          </h1>
          <p className="text-gray-400">
            Ingresa tu correo electrónico y te enviaremos un nuevo enlace de
            verificación
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-red-600 to-red-900 rounded-lg blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>

          <form
            className="relative space-y-6 bg-zinc-950 p-8 md:p-10 border border-white/5 rounded-sm"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  className={`pl-12 h-14 bg-zinc-900/50 border-white/10 focus:border-red-600 focus:ring-red-600/20 text-white transition-all placeholder:text-gray-600 ${
                    error ? "border-red-500" : ""
                  }`}
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                />
              </div>
              {error && (
                <p className="text-red-400 text-xs mt-1">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-white text-black hover:bg-red-600 hover:text-white text-sm font-black tracking-widest transition-all duration-300 group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <>
                  Enviar Email de Verificación
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            ¿Ya verificaste tu cuenta?{" "}
            <button
              onClick={() => navigate("/auth")}
              className="text-white font-bold hover:text-red-600 transition-colors border-b border-white/10 hover:border-red-600 pb-0.5 ml-1"
            >
              Iniciar Sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
