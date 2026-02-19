import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface CheckoutFormData {
  guestEmail?: string;
  shippingAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  isLoading?: boolean;
}

export function CheckoutForm({ onSubmit, isLoading }: CheckoutFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CheckoutFormData>({
    shippingAddress: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-zinc-900 p-6 rounded-lg border border-zinc-800"
    >
      <h2 className="text-xl font-bold text-white mb-4">
        {t("checkout.shippingDetails", "Detalles de Envío")}
      </h2>

      <div className="space-y-2">
        <Label htmlFor="guestEmail" className="text-zinc-300">
          {t("checkout.email", "Email (Opcional)")}
        </Label>
        <Input
          id="guestEmail"
          name="guestEmail"
          type="email"
          placeholder="tu@email.com"
          value={formData.guestEmail || ""}
          onChange={handleChange}
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-red-600"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shippingAddress" className="text-zinc-300">
          {t("checkout.shippingAddress", "Dirección de Envío")}
        </Label>
        <Input
          id="shippingAddress"
          name="shippingAddress"
          required
          placeholder={t("checkout.addressPlaceholder", "Calle 123")}
          value={formData.shippingAddress}
          onChange={handleChange}
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-red-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-zinc-300">
            {t("checkout.city", "Ciudad")}
          </Label>
          <Input
            id="city"
            name="city"
            required
            value={formData.city}
            onChange={handleChange}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-red-600"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state" className="text-zinc-300">
            {t("checkout.state", "Estado/Provincia")}
          </Label>
          <Input
            id="state"
            name="state"
            required
            value={formData.state}
            onChange={handleChange}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-red-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country" className="text-zinc-300">
            {t("checkout.country", "País")}
          </Label>
          <Input
            id="country"
            name="country"
            required
            value={formData.country}
            onChange={handleChange}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-red-600"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode" className="text-zinc-300">
            {t("checkout.postalCode", "Código Postal")}
          </Label>
          <Input
            id="postalCode"
            name="postalCode"
            required
            value={formData.postalCode}
            onChange={handleChange}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-red-600"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 mt-4"
        disabled={isLoading}
      >
        {isLoading
          ? t("common.processing", "Procesando...")
          : t("checkout.continueToPayment", "Continuar al Pago")}
      </Button>
    </form>
  );
}
