"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { deleteSupplier } from "@/actions/delete-supplier";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { suppliersTable } from "@/db/schema";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import UpsertSupplierForm from "./upsert-supplier-form";

type Supplier = typeof suppliersTable.$inferSelect;

export const suppliersTableColumns = (): ColumnDef<Supplier>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "phone",
    accessorKey: "phone",
    header: "Telefone",
    cell: ({ row }) => row.original.phone ?? "-",
  },
  {
    id: "address",
    accessorKey: "address",
    header: "Endereço",
    cell: ({ row }) => row.original.address ?? "-",
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const supplier = row.original;
      return <SupplierActions supplier={supplier} />;
    },
  },
];

function SupplierActions({ supplier }: { supplier: Supplier }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { execute: deleteSupplierAction, status: deleteStatus } = useAction(
    deleteSupplier,
    {
      onSuccess: () => {
        toast.success("Fornecedor deletado com sucesso!");
        window.location.reload();
      },
      onError: (error) => {
        const message =
          error.error?.serverError ?? "Erro ao deletar fornecedor.";
        toast.error(message);
      },
    },
  );

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <UpsertSupplierForm
          supplier={supplier}
          onSuccess={() => setIsEditDialogOpen(false)}
        />
      </Dialog>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-red-500 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja deletar este fornecedor?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Todos os dados relacionados a
              este fornecedor serão perdidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSupplierAction({ id: supplier.id })}
              disabled={deleteStatus === "executing"}
            >
              {deleteStatus === "executing" ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

