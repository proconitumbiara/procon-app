import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const TicketStatusSchema = z.enum([
  "pending",
  "in-attendance",
  "finished",
  "cancelled",
]);

export const UpdateTicketSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  status: TicketStatusSchema.optional(),
  sectorId: z.string().optional(),
  clientId: z.string().optional(),
  priority: z.number().int().min(0).max(1).optional(),
});

export const CreateTicketSchema = z.object({
  status: TicketStatusSchema,
  sectorId: z.string().min(1, "ID do setor é obrigatório"),
  clientId: z.string().min(1, "ID do cliente é obrigatório"),
  priority: z.number().int().min(0).max(1).optional().default(0),
});

export type UpdateTicketSchema = z.infer<typeof UpdateTicketSchema>;
export type CreateTicketSchema = z.infer<typeof CreateTicketSchema>;
