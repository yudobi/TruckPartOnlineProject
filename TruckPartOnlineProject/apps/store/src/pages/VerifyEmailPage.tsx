import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import authService from "@/services/auth";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function VerifyEmailPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!uid || !token) {
      setStatus("error");
      setMessage("Token de verificación no encontrado");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await authService.verifyEmail(uid, token);
        
        // Guardar tokens en localStorage
        localStorage.setItem("accessToken", response.access);
        localStorage.setItem("refreshToken", response.refresh);
        
        // Actualizar usuario en el contexto
        setUser(response.user);
        
        setStatus("success");
        setMessage(response.message || "¡Email verificado exitosamente!");
        toast.success("Email verificado correctamente");
        
        // Redirigir automáticamente después de 2 segundos
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (error) {
        setStatus("error");
        setMessage("El token de verificación es inválido o ha expirado");
        toast.error("Error al verificar el email");
        console.error(error);
      }
    };

    verifyEmail();
  }, [uid, token, navigate, setUser]);

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full mb-6 text-red-500 text-xs font-bold tracking-widest uppercase">
            Verificación de Email
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-red-600 to-red-900 rounded-lg blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

          <div className="relative bg-zinc-950 p-8 md:p-10 border border-white/5 rounded-sm">
            <div className="flex flex-col items-center text-center space-y-6">
              {status === "loading" && (
                <>
                  <Loader2 className="h-16 w-16 text-red-600 animate-spin" />
                  <h2 className="text-2xl font-bold text-white">
                    Verificando tu email...
                  </h2>
                  <p className="text-gray-400">
                    Por favor espera mientras verificamos tu correo electrónico
                  </p>
                </>
              )}

              {status === "success" && (
                <>
                  <CheckCircle className="h-16 w-16 text-green-500" />
                  <h2 className="text-2xl font-bold text-white">
                    ¡Verificación Exitosa!
                  </h2>
                  <p className="text-gray-400">{message}</p>
                  <p className="text-sm text-gray-500">
                    Redirigiendo a la página principal...
                  </p>
                  <Button
                    onClick={() => navigate("/")}
                    className="w-full h-12 bg-white text-black hover:bg-red-600 hover:text-white text-sm font-black tracking-widest transition-all duration-300"
                  >
                    Ir al Inicio
                  </Button>
                </>
              )}

              {status === "error" && (
                <>
                  <XCircle className="h-16 w-16 text-red-500" />
                  <h2 className="text-2xl font-bold text-white">
                    Error de Verificación
                  </h2>
                  <p className="text-gray-400">{message}</p>
                  <div className="flex flex-col gap-3 w-full">
                    <Button
                      onClick={() => navigate("/resend-verification")}
                      className="w-full h-12 bg-white text-black hover:bg-red-600 hover:text-white text-sm font-black tracking-widest transition-all duration-300"
                    >
                      Reenviar Email de Verificación
                    </Button>
                    <Button
                      onClick={() => navigate("/")}
                      variant="outline"
                      className="w-full h-12 border-white/10 text-white hover:bg-white/5 text-sm font-black tracking-widest transition-all duration-300"
                    >
                      Volver al Inicio
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
