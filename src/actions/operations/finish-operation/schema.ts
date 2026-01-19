import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const schema = z.object({
  operationId: z.string().min(1, "Operação é obrigatória"),
});

export type Schema = z.infer<typeof schema>;
