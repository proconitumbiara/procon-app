import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL deve ser uma URL válida"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET deve ter pelo menos 32 caracteres"),
  PUSHER_APP_ID: z.string().min(1, "PUSHER_APP_ID é obrigatório"),
  PUSHER_KEY: z.string().min(1, "PUSHER_KEY é obrigatório"),
  PUSHER_SECRET: z.string().min(1, "PUSHER_SECRET é obrigatório"),
  PUSHER_CLUSTER: z.string().min(1, "PUSHER_CLUSTER é obrigatório"),
  NEXT_PUBLIC_PUSHER_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_PUSHER_KEY é obrigatório"),
  NEXT_PUBLIC_PUSHER_CLUSTER: z
    .string()
    .min(1, "NEXT_PUBLIC_PUSHER_CLUSTER é obrigatório"),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL deve ser uma URL válida"),
  TRUSTED_ORIGINS: z.string().optional(),
});

export const env = envSchema.parse(process.env);
