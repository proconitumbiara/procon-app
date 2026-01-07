import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  USER_NOT_AUTHORIZED: "USER_NOT_AUTHORIZED",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
  [ErrorTypes.USER_NOT_AUTHORIZED]:
    "Usuário não autorizado a realizar esta ação",
} as const;

export const upsertServiceSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .trim()
    .min(1, { message: "O nome do serviço é obrigatório." }),
  slug: z
    .string()
    .trim()
    .min(1, { message: "O slug do serviço é obrigatório." }),
  description: z.string().trim().optional(),
  requirements: z.string().trim().optional(),
  howToApply: z.string().trim().optional(),
  contactEmail: z.string().trim().email().optional(),
  contactPhone: z.string().trim().optional(),
  isActive: z.boolean(),
  emphasis: z.boolean().optional(),
});

export type UpsertServiceInput = z.infer<typeof upsertServiceSchema>;
