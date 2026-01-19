export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  CLIENT_NOT_FOUND: "CLIENT_NOT_FOUND",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
  [ErrorTypes.CLIENT_NOT_FOUND]: "Cliente não encontrado",
} as const;

export type ErrorType = keyof typeof ErrorTypes;
