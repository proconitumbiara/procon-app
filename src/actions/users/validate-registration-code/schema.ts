import { z } from "zod";

export const ErrorTypes = {
  CODE_REQUIRED: "CODE_REQUIRED",
  CODE_NOT_FOUND: "CODE_NOT_FOUND",
  CODE_EXPIRED: "CODE_EXPIRED",
  CODE_ALREADY_USED: "CODE_ALREADY_USED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export const ErrorMessages = {
  [ErrorTypes.CODE_REQUIRED]: "Código de registro é obrigatório",
  [ErrorTypes.CODE_NOT_FOUND]: "Código de registro não encontrado",
  [ErrorTypes.CODE_EXPIRED]: "Código de registro expirado",
  [ErrorTypes.CODE_ALREADY_USED]: "Código de registro já foi utilizado",
  [ErrorTypes.VALIDATION_ERROR]: "Erro ao validar código de registro",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const validateRegistrationCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, "Código deve ter 6 caracteres")
    .max(6, "Código deve ter 6 caracteres")
    .regex(/^[A-Z0-9]{6}$/i, "Código deve conter apenas letras e números"),
});
