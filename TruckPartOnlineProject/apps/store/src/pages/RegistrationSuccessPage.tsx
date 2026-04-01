import { Mail, CheckCircle, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router";
import { useEffect } from "react";

export default function RegistrationSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  useEffect(() => {
    // Si no hay email en el state, redirigir al login
    if (!email) {
      navigate("/auth");
    }
  }, [email, navigate]);

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center px-6">
      <Helmet>
        <title>Registro Exitoso | Tony Truck Parts</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full mb-6 text-red-500 text-xs font-bold tracking-widest uppercase">
            Registro Exitoso
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 rounded-lg blur opacity-20"></div>
          
          <div className="relative bg-zinc-950 p-8 border border-white/5 rounded-sm">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
                <CheckCircle className="relative h-16 w-16 text-green-500" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  ¡Cuenta Creada Exitosamente!
                </h2>
                <p className="text-gray-400">
                  Hemos enviado un correo de verificación a
                </p>
                <p className="text-white font-semibold break-all">
                  {email}
                </p>
              </div>

              <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-sm p-4 space-y-2 w-full">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm text-yellow-200 font-semibold mb-1">
                      Verifica tu correo para continuar
                    </p>
                    <p className="text-xs text-yellow-300/80">
                      Revisa tu bandeja de entrada y haz clic en el enlace de verificación. 
                      Si no lo encuentras, revisa tu carpeta de spam.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full pt-4">
                <Button
                  onClick={() => navigate("/auth")}
                  className="w-full h-12 bg-white text-black hover:bg-red-600 hover:text-white text-sm font-black tracking-widest transition-all duration-300"
                >
                  Ir al Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => navigate("/resend-verification")}
                  variant="outline"
                  className="w-full h-12 border-white/10 text-white hover:bg-white/5 text-sm font-semibold"
                >
                  Reenviar Correo de Verificación
                </Button>
              </div>

              <div className="pt-4 border-t border-white/5 w-full">
                <p className="text-xs text-gray-500 text-center">
                  ¿No recibiste el correo? Puede tardar unos minutos en llegar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
