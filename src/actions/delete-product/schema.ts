import { z } from "zod";

export const deleteProductSchema = z.object({
  id: z.string().uuid({ message: "ID do produto inválido." }),
});

export type DeleteProductInput = z.infer<typeof deleteProductSchema>;

