"use client";

import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { upsertSupplier } from "@/actions/upsert-supplier";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { suppliersTable } from "@/db/schema";

type Supplier = typeof suppliersTable.$inferSelect;

interface UpsertSupplierFormProps {
  supplier?: Supplier;
  onSuccess?: () => void;
}

const UpsertSupplierForm = ({
  supplier,
  onSuccess,
}: UpsertSupplierFormProps) => {
  const [name, setName] = useState(supplier?.name ?? "");
  const [phone, setPhone] = useState(supplier?.phone ?? "");
  const [address, setAddress] = useState(supplier?.address ?? "");

  const { execute, status } = useAction(upsertSupplier, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        return;
      }
      toast.success(
        supplier
          ? "Fornecedor atualizado com sucesso!"
          : "Fornecedor criado com sucesso!",
      );
      onSuccess?.();
      window.location.reload();
    },
    onError: () => {
      toast.error("Erro ao salvar fornecedor.");
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Informe o nome do fornecedor.");
      return;
    }
    execute({
      id: supplier?.id,
      name: name.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    });
  };

  return (
    <DialogContent>
      <DialogTitle>
        {supplier ? "Editar fornecedor" : "Novo fornecedor"}
      </DialogTitle>
      <DialogDescription>
        {supplier
          ? "Atualize os dados do fornecedor."
          : "Cadastre um novo fornecedor."}
      </DialogDescription>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nome</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do fornecedor"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Telefone</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(00) 00000-0000"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Endereço</label>
          <textarea
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Endereço completo"
            rows={3}
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={onSuccess}
          disabled={status === "executing"}
        >
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={status === "executing"}>
          {status === "executing" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : supplier ? (
            "Atualizar"
          ) : (
            "Criar"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default UpsertSupplierForm;

