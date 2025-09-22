import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const UpsertClientschema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres").optional(),
  register: z
    .string()
    .min(11, "O CPF deve ter pelo menos 11 caracteres")
    .optional(),
  phoneNumber: z
    .string()
    .min(11, "O telefone deve ter pelo menos 11 caracteres")
    .optional(),
});

export const InsertClientSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  register: z.string().min(11, "O CPF deve ter pelo menos 11 caracteres"),
  phoneNumber: z
    .string()
    .min(11, "O telefone deve ter pelo menos 11 caracteres"),
});

export type Schema = z.infer<typeof UpsertClientschema>;
