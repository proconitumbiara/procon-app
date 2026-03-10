import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  OPERATION_ALREADY_ACTIVE: "OPERATION_ALREADY_ACTIVE",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
  [ErrorTypes.OPERATION_ALREADY_ACTIVE]: "Existe uma operação em andamento",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const schema = z.object({
  servicePointId: z.string().min(1, "Ponto de serviço é obrigatório"),
});

export type Schema = z.infer<typeof schema>;
