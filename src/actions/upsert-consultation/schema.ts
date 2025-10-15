import { z } from "zod";

export const ErrorTypes = {
    UNAUTHENTICATED: "UNAUTHENTICATED",
} as const;

export const ErrorMessages = {
    [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const UpdateConsultationSchema = z.object({
    id: z.string().min(1, "ID é obrigatório"),
    consultationNumber: z.string().optional(),
    authorizationArquive: z.string().optional(),
});

export const CreateConsultationSchema = z.object({
    consultationNumber: z.string().optional(),
    authorizationArquive: z.string().optional(),
    treatmentId: z.string().min(1, "ID do tratamento é obrigatório"),
    ticketId: z.string().min(1, "ID do ticket é obrigatório"),
});

export type UpdateConsultationSchema = z.infer<typeof UpdateConsultationSchema>;
export type CreateConsultationSchema = z.infer<typeof CreateConsultationSchema>;
