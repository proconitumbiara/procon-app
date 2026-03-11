import { z } from "zod";

export const ErrorTypes = {
  PAUSE_NOT_FOUND: "PAUSE_NOT_FOUND",
  PAUSE_NOT_IN_PROGRESS: "PAUSE_NOT_IN_PROGRESS",
} as const;

export const ErrorMessages = {
  [ErrorTypes.PAUSE_NOT_FOUND]: "Pausa não encontrada",
  [ErrorTypes.PAUSE_NOT_IN_PROGRESS]: "Pausa já foi encerrada",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const schema = z.object({
  pauseId: z.string().uuid("ID da pausa inválido"),
});

export type Schema = z.infer<typeof schema>;
