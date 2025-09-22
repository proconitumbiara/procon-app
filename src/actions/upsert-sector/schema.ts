import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_NOT_AUTHORIZED: "USER_NOT_AUTHORIZED",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
  [ErrorTypes.USER_NOT_FOUND]: "Usuário não encontrado",
  [ErrorTypes.USER_NOT_AUTHORIZED]:
    "Usuário não autorizado a realizar esta ação",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const upsertSectorSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, { message: "Nome é obrigatório." }),
});

export type upsertSectorSchema = z.infer<typeof upsertSectorSchema>;
