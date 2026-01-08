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

const itemSchema = z.object({
  productId: z.string().uuid({ message: "Produto inválido." }),
  supplierId: z.string().uuid({ message: "Fornecedor inválido." }),
  price: z
    .number({
      invalid_type_error: "Preço inválido.",
    })
    .int()
    .nonnegative({ message: "Preço deve ser positivo." }),
});

export const upsertPriceSearchSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .trim()
    .min(1, { message: "O título da pesquisa é obrigatório." }),
  slug: z
    .string()
    .trim()
    .min(1, { message: "O slug da pesquisa é obrigatório." }),
  summary: z.string().trim().optional(),
  description: z.string().trim().optional(),
  coverImageUrl: z.string().trim().optional(),
  emphasis: z.boolean().optional(),
  year: z
    .number({ invalid_type_error: "Ano inválido." })
    .int()
    .min(2000, { message: "Ano inválido." }),
  collectionDate: z.string().trim().optional(),
  observation: z.string().trim().optional(),
  items: z
    .array(itemSchema)
    .min(1, { message: "Inclua ao menos um item na pesquisa." }),
});

export type UpsertPriceSearchInput = z.infer<typeof upsertPriceSearchSchema>;

