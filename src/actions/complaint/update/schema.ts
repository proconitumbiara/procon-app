import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  COMPLAINT_NOT_FOUND: "COMPLAINT_NOT_FOUND",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
  [ErrorTypes.COMPLAINT_NOT_FOUND]: "Denúncia não encontrada",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const schema = z.object({
  complaintId: z.string().min(1, "Denúncia é obrigatória"),
  viewingStatus: z.enum(["pending", "viewed"]).optional().default("pending"),
  viewingDate: z.string().optional().nullable(),
});

export type Schema = z.infer<typeof schema>;
