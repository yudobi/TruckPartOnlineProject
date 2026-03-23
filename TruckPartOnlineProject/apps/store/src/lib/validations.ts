import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "El usuario debe tener al menos 3 caracteres")
      .max(30, "El usuario no puede exceder 30 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos"),
    email: z.string().min(1, "El email es requerido").email("Email inválido"),
    phone_number: z
      .string()
      .regex(/^[\d\s\-()+]+$/, "Formato de teléfono inválido")
      .min(10, "El teléfono debe tener al menos 10 dígitos")
      .optional()
      .or(z.literal("")),
    full_name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
});

export const resetPasswordSchema = z
  .object({
    new_password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.new_password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const checkoutFormSchema = z.object({
  fullName: z.string().min(2, "El nombre es requerido"),
  guestEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^[\d\s\-()+]+$/, "Formato de teléfono inválido")
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .optional()
    .or(z.literal("")),
  shippingAddress: z.string().min(5, "La dirección es requerida"),
  city: z.string().min(2, "La ciudad es requerida"),
  state: z.string().min(2, "El estado es requerido"),
  country: z.string().min(2, "El país es requerido"),
  postalCode: z.string().min(3, "El código postal es requerido"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CheckoutFormSchemaData = z.infer<typeof checkoutFormSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
