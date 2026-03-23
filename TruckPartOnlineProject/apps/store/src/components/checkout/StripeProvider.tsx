import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

const appearance: StripeElementsOptions["appearance"] = {
  theme: "night",
  variables: {
    colorPrimary: "#dc2626",
    colorBackground: "#18181b",
    colorText: "#ffffff",
    colorDanger: "#ef4444",
    colorTextSecondary: "#a1a1aa",
    colorTextPlaceholder: "#71717a",
    borderRadius: "6px",
    fontSizeBase: "14px",
  },
  rules: {
    ".Input": {
      backgroundColor: "#27272a",
      border: "1px solid #3f3f46",
      color: "#ffffff",
    },
    ".Input:focus": {
      border: "1px solid #dc2626",
      boxShadow: "0 0 0 1px #dc2626",
    },
    ".Label": {
      color: "#d4d4d8",
      fontWeight: "500",
    },
    ".Tab": {
      backgroundColor: "#27272a",
      border: "1px solid #3f3f46",
      color: "#a1a1aa",
    },
    ".Tab:hover": {
      backgroundColor: "#3f3f46",
      color: "#ffffff",
    },
    ".Tab--selected": {
      backgroundColor: "#27272a",
      border: "1px solid #dc2626",
      color: "#ffffff",
    },
  },
};

interface StripeProviderProps {
  clientSecret: string;
  children: React.ReactNode;
}

export function StripeProvider({ clientSecret, children }: StripeProviderProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
