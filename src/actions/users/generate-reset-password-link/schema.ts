import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_NOT_AUTHORIZED: "USER_NOT_AUTHORIZED",
  GENERATION_ERROR: "GENERATION_ERROR",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
  [ErrorTypes.USER_NOT_FOUND]: "Usuário não encontrado",
  [ErrorTypes.USER_NOT_AUTHORIZED]:
    "Usuário não autorizado a realizar esta ação",
  [ErrorTypes.GENERATION_ERROR]: "Erro ao gerar link de reset de senha",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const schema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
});

export type Schema = z.infer<typeof schema>;

