import { useTranslation } from "react-i18next";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Banknote } from "lucide-react";

export type PaymentMethod = "card" | "cod";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
}: PaymentMethodSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-white">
        {t("checkout.selectPaymentMethod")}
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
              {t("checkout.paymentMethod.card")}
            </span>
            <span className="text-xs text-zinc-400 mt-1">
              {t("checkout.paymentMethod.cardDesc")}
            </span>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="cod" id="cod" className="peer sr-only" disabled />
          <Label
            htmlFor="cod"
            className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-800 p-4 opacity-50 cursor-not-allowed transition-all"
          >
            <Banknote className="mb-3 h-6 w-6 text-white" />
            <span className="text-white font-bold">
              {t("checkout.paymentMethod.cod")}
            </span>
            <span className="text-xs text-zinc-400 mt-1">
              {t("checkout.paymentMethod.codDesc")}
            </span>
            <span className="text-xs text-zinc-500 mt-1">
              {t("checkout.paymentMethod.codDisabled")}
            </span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
