import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_NOT_AUTHORIZED: "USER_NOT_AUTHORIZED",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
  [ErrorTypes.USER_NOT_FOUND]: "Usuário não encontrado",
  [ErrorTypes.USER_NOT_AUTHORIZED]:
    "Usuário não autorizado a realizar esta ação",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const schema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres").optional(),
  phoneNumber: z
    .string()
    .min(11, "O telefone deve ter pelo menos 11 caracteres")
    .optional(),
  cpf: z.string().min(11, "O CPF deve ter pelo menos 11 caracteres").optional(),
  role: z
    .string()
    .min(3, "O cargo deve ter pelo menos 3 caracteres")
    .optional(),
});

export type Schema = z.infer<typeof schema>;
