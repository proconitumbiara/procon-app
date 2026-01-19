import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  NO_ACTIVE_OPERATION: "NO_ACTIVE_OPERATION",
  TREATMENT_IN_PROGRESS: "TREATMENT_IN_PROGRESS",
  SERVICE_POINT_NOT_FOUND: "SERVICE_POINT_NOT_FOUND",
  SECTOR_NOT_FOUND: "SECTOR_NOT_FOUND",
  NO_PENDING_TICKET: "NO_PENDING_TICKET",
  CLIENT_NOT_FOUND: "CLIENT_NOT_FOUND",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
  [ErrorTypes.NO_ACTIVE_OPERATION]:
    "Nenhuma operação ativa encontrada para o usuário logado",
  [ErrorTypes.TREATMENT_IN_PROGRESS]:
    "Já existe um atendimento em andamento para esta operação",
  [ErrorTypes.SERVICE_POINT_NOT_FOUND]:
    "Ponto de serviço da operação não encontrado",
  [ErrorTypes.SECTOR_NOT_FOUND]: "Setor não encontrado",
  [ErrorTypes.NO_PENDING_TICKET]:
    "Nenhum ticket pendente encontrado para o setor",
  [ErrorTypes.CLIENT_NOT_FOUND]: "Cliente do ticket não encontrado",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const CreateTreatmentSchema = z.object({
  ticketId: z.string().min(1, "ID do ticket é obrigatório"),
  operationId: z.string().min(1, "ID da operação é obrigatório"),
});

export type Schema = z.infer<typeof CreateTreatmentSchema>;
