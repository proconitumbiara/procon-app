import { z } from "zod";

export const ErrorTypes = {
    UNAUTHENTICATED: "UNAUTHENTICATED",
} as const;

export const ErrorMessages = {
    [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const UpdateComplaintSchema = z.object({
    id: z.string().min(1, "ID é obrigatório"),
    caseNumber: z.string().optional(),
    consumerName: z.string().optional(),
    supplierName: z.string().optional(),
    numberOfPages: z.number().optional(),
    status: z.string().optional(),
    authorizationArquive: z.string().optional(),
});

export const CreateComplaintSchema = z.object({
    caseNumber: z.string().optional(),
    consumerName: z.string().optional(),
    supplierName: z.string().optional(),
    numberOfPages: z.number().optional(),
    status: z.string().default("open"),
    authorizationArquive: z.string().optional(),
    treatmentId: z.string().min(1, "ID do tratamento é obrigatório"),
    ticketId: z.string().min(1, "ID do ticket é obrigatório"),
});

export type UpdateComplaintSchema = z.infer<typeof UpdateComplaintSchema>;
export type CreateComplaintSchema = z.infer<typeof CreateComplaintSchema>;
