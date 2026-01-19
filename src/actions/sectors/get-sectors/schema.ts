export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  SECTOR_NOT_FOUND: "SECTOR_NOT_FOUND",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
  [ErrorTypes.SECTOR_NOT_FOUND]: "Setor não encontrado",
} as const;

export type ErrorType = keyof typeof ErrorTypes;
