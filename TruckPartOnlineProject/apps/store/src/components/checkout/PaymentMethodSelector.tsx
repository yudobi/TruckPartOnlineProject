import { useTranslation } from "react-i18next";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PaymentMethod = "card" | "cod";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
  onSubmit,
  isLoading,
}: PaymentMethodSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 bg-zinc-900 p-6 rounded-lg border border-zinc-800">
      <h2 className="text-xl font-bold text-white mb-4">
        {t("checkout.paymentMethod", "Método de Pago")}
      </h2>

      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => onSelect(value as PaymentMethod)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <RadioGroupItem value="card" id="card" className="peer sr-only" />
          <Label
            htmlFor="card"
            className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-800 p-4 hover:bg-zinc-700 peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:text-red-600 cursor-pointer transition-all"
          >
            <CreditCard className="mb-3 h-6 w-6 text-white" />
            <span className="text-white font-bold">
              {t("checkout.card", "Tarjeta de Crédito")}
            </span>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
          <Label
            htmlFor="cod"
            className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-800 p-4 hover:bg-zinc-700 peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:text-red-600 cursor-pointer transition-all"
          >
            <Banknote className="mb-3 h-6 w-6 text-white" />
            <span className="text-white font-bold">
              {t("checkout.cod", "Pago Contra Entrega")}
            </span>
          </Label>
        </div>
      </RadioGroup>

      <Button
        onClick={onSubmit}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 mt-4"
        disabled={isLoading}
      >
        {isLoading
          ? t("common.processing", "Procesando...")
          : t("checkout.payNow", "Pagar Ahora")}
      </Button>
    </div>
  );
}
