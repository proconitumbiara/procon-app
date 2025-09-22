import { z } from "zod";

export const ErrorTypes = {
  UPDATE_USER_DATA_ERROR: "UPDATE_USER_DATA_ERROR",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UPDATE_USER_DATA_ERROR]: "Erro ao atualizar dados do usuário",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const updateUserDataSchema = z.object({
  userId: z.string(),
  cpf: z.string().min(1, "CPF é obrigatório"),
  phoneNumber: z.string().min(1, "Telefone é obrigatório"),
  role: z.string().optional(),
});
