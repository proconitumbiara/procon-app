import { z } from "zod";

export const ErrorTypes = {
  NO_OPERATING_OPERATION: "NO_OPERATING_OPERATION",
  TREATMENT_IN_PROGRESS: "TREATMENT_IN_PROGRESS",
} as const;

export const ErrorMessages = {
  [ErrorTypes.NO_OPERATING_OPERATION]: "Nenhuma operação em andamento",
  [ErrorTypes.TREATMENT_IN_PROGRESS]:
    "Não é possível pausar com atendimento em andamento",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const PAUSE_REASONS = [
  "Reunião",
  "Pessoal",
  "Organização de processos",
  "Eventos",
  "Problema técnico",
] as const;

export const schema = z.object({
  reason: z.enum(PAUSE_REASONS, {
    message: "Selecione o motivo da pausa",
  }),
});

export type Schema = z.infer<typeof schema>;
