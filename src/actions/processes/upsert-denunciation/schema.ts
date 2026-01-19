import { z } from "zod";

export const ErrorTypes = {
    UNAUTHENTICATED: "UNAUTHENTICATED",
} as const;

export const ErrorMessages = {
    [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const UpdateDenunciationSchema = z.object({
    id: z.string().min(1, "ID é obrigatório"),
    denunciationNumber: z.string().optional(),
    authorizationArquive: z.string().optional(),
});

export const CreateDenunciationSchema = z.object({
    denunciationNumber: z.string().optional(),
    authorizationArquive: z.string().optional(),
    treatmentId: z.string().min(1, "ID do tratamento é obrigatório"),
    ticketId: z.string().min(1, "ID do ticket é obrigatório"),
});

export type UpdateDenunciationSchema = z.infer<typeof UpdateDenunciationSchema>;
export type CreateDenunciationSchema = z.infer<typeof CreateDenunciationSchema>;
