import { z } from "zod";

export const ErrorTypes = {
    UNAUTHENTICATED: "UNAUTHENTICATED",
    TREATMENT_NOT_FOUND: "TREATMENT_NOT_FOUND",
    TREATMENT_NOT_IN_SERVICE: "TREATMENT_NOT_IN_SERVICE",
    TICKET_NOT_FOUND: "TICKET_NOT_FOUND",
} as const;

export const ErrorMessages = {
    [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
    [ErrorTypes.TREATMENT_NOT_FOUND]: "Atendimento não encontrado",
    [ErrorTypes.TREATMENT_NOT_IN_SERVICE]: "Atendimento não está em andamento",
    [ErrorTypes.TICKET_NOT_FOUND]: "Ticket não encontrado",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const CancelTreatmentAndTicketSchema = z.object({
    treatmentId: z.string().min(1, "ID do atendimento é obrigatório"),
    ticketId: z.string().min(1, "ID do ticket é obrigatório"),
});

export type Schema = z.infer<typeof CancelTreatmentAndTicketSchema>;
