import { z } from "zod";

export const deleteSupplierSchema = z.object({
  id: z.string().uuid({ message: "ID do fornecedor inválido." }),
});

export type DeleteSupplierInput = z.infer<typeof deleteSupplierSchema>;

