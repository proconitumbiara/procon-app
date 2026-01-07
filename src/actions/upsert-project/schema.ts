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

export const upsertProjectSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .trim()
    .min(1, { message: "O título do projeto é obrigatório." }),
  slug: z
    .string()
    .trim()
    .min(1, { message: "O slug do projeto é obrigatório." }),
  summary: z.string().trim().optional(),
  description: z.string().trim().optional(),
  coverImageUrl: z.string().trim().optional(),
  emphasis: z.boolean().optional(),
});

export type UpsertProjectInput = z.infer<typeof upsertProjectSchema>;
