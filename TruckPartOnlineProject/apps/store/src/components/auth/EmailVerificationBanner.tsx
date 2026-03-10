import { AlertCircle, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Solo mostrar si el usuario está autenticado pero no verificado
  if (!user || user.is_verified !== false) {
    return null;
  }

  return (
    <div className="bg-yellow-600/10 border-b border-yellow-600/20 py-3 px-4">
      <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          <p className="text-sm text-yellow-200">
            Tu cuenta no está verificada. Por favor verifica tu correo electrónico para acceder a todas las funcionalidades.
          </p>
        </div>
        <Button
          onClick={() => navigate("/resend-verification")}
          size="sm"
          variant="outline"
          className="border-yellow-600/30 text-yellow-200 hover:bg-yellow-600/20 hover:text-yellow-100 flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Reenviar Email
        </Button>
      </div>
    </div>
  );
}
