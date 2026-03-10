import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

interface RegistrationSuccessModalProps {
  email: string;
  onClose: () => void;
}

export default function RegistrationSuccessModal({ email, onClose }: RegistrationSuccessModalProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-md w-full">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 rounded-lg blur opacity-20"></div>
        
        <div className="relative bg-zinc-950 p-8 border border-white/5 rounded-sm">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
              <CheckCircle className="relative h-16 w-16 text-green-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                ¡Cuenta Creada!
              </h2>
              <p className="text-gray-400">
                Hemos enviado un email de verificación a
              </p>
              <p className="text-white font-semibold">
                {email}
              </p>
            </div>

            <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-sm p-4 space-y-2">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm text-yellow-200 font-semibold mb-1">
                    Verifica tu email para continuar
                  </p>
                  <p className="text-xs text-yellow-300/80">
                    Revisa tu bandeja de entrada y haz clic en el enlace de verificación. 
                    Si no lo encuentras, revisa tu carpeta de spam.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={onClose}
                className="w-full h-12 bg-white text-black hover:bg-red-600 hover:text-white text-sm font-black tracking-widest transition-all duration-300"
              >
                Entendido
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  navigate("/resend-verification");
                }}
                variant="outline"
                className="w-full h-12 border-white/10 text-white hover:bg-white/5 text-sm font-black tracking-widest transition-all duration-300"
              >
                ¿No recibiste el email?
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
