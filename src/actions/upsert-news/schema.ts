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

export const upsertNewsSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .trim()
    .min(1, { message: "O título da notícia é obrigatório." }),
  slug: z
    .string()
    .trim()
    .min(1, { message: "O slug da notícia é obrigatório." }),
  excerpt: z.string().trim().optional(),
  content: z.string().trim().optional(),
  coverImageUrl: z.string().trim().optional(),
  publishedAt: z.string().optional(),
  isPublished: z.boolean(),
  emphasis: z.boolean().optional(),
});

export type UpsertNewsInput = z.infer<typeof upsertNewsSchema>;
