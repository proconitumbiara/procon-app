import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  USER_NOT_AUTHORIZED: "USER_NOT_AUTHORIZED",
  GENERATION_ERROR: "GENERATION_ERROR",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
  [ErrorTypes.USER_NOT_AUTHORIZED]: "Usuário não autorizado",
  [ErrorTypes.GENERATION_ERROR]: "Erro ao gerar código de registro",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

// Schema vazio pois não precisa de input
export const generateRegistrationCodeSchema = z.object({});
