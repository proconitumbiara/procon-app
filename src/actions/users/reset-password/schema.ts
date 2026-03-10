import { z } from "zod";

export const ErrorTypes = {
  CODE_NOT_FOUND: "CODE_NOT_FOUND",
  CODE_ALREADY_USED: "CODE_ALREADY_USED",
  CODE_EXPIRED: "CODE_EXPIRED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RESET_ERROR: "RESET_ERROR",
} as const;

export const ErrorMessages = {
  [ErrorTypes.CODE_NOT_FOUND]: "Código não encontrado",
  [ErrorTypes.CODE_ALREADY_USED]: "Código já foi utilizado",
  [ErrorTypes.CODE_EXPIRED]: "Código expirado",
  [ErrorTypes.VALIDATION_ERROR]: "Erro ao validar código",
  [ErrorTypes.RESET_ERROR]: "Erro ao redefinir senha",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(6, "Código deve ter 6 caracteres")
      .max(6, "Código deve ter 6 caracteres")
      .regex(/^[A-Z0-9]{6}$/i, "Código deve conter apenas letras e números"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z
      .string()
      .min(8, "A confirmação deve ter pelo menos 8 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
