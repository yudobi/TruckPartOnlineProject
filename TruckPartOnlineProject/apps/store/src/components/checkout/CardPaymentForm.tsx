import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Loader2, LockKeyhole } from "lucide-react";

interface CardPaymentFormProps {
  orderId: number;
  isLoading?: boolean;
}

export function CardPaymentForm({ orderId, isLoading = false }: CardPaymentFormProps) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const returnUrl = `${window.location.origin}/orders/confirmation/${orderId}`;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    // confirmPayment only reaches here if there was an error (redirect otherwise)
    if (error) {
      setErrorMessage(error.message ?? t("checkout.card.genericError"));
      setIsProcessing(false);
    }
  };

  const isDisabled = !stripe || !elements || isProcessing || isLoading;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-zinc-900 p-6 rounded-lg border border-zinc-800"
    >
      <h2 className="text-xl font-bold text-white mb-4">
        {t("checkout.card.title")}
      </h2>

      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 mt-4 flex items-center justify-center gap-2"
        disabled={isDisabled}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("checkout.processing")}
          </>
        ) : (
          <>
            <LockKeyhole className="w-4 h-4" />
            {t("checkout.card.payNow")}
          </>
        )}
      </Button>
    </form>
  );
}
