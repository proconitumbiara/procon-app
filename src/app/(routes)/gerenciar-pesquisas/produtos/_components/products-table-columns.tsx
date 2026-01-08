"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { deleteProduct } from "@/actions/delete-product";
import { upsertProduct } from "@/actions/upsert-product";
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
import { categoriesTable, productsTable } from "@/db/schema";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import UpsertProductForm from "./upsert-product-form";

type Product = typeof productsTable.$inferSelect & {
  category: typeof categoriesTable.$inferSelect;
};
type Category = typeof categoriesTable.$inferSelect;

export const productsTableColumns = (
  categories: Category[],
): ColumnDef<Product>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "category",
    accessorKey: "category.name",
    header: "Categoria",
    cell: ({ row }) => row.original.category.name,
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const product = row.original;
      return <ProductActions product={product} categories={categories} />;
    },
  },
];

function ProductActions({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { execute: deleteProductAction, status: deleteStatus } = useAction(
    deleteProduct,
    {
      onSuccess: () => {
        toast.success("Produto deletado com sucesso!");
        window.location.reload();
      },
      onError: (error) => {
        const message =
          error.error?.serverError ?? "Erro ao deletar produto.";
        toast.error(message);
      },
    },
  );

  return (
    <div className="flex items-center gap-2">
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <UpsertProductForm
          product={product}
          categories={categories}
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
              Tem certeza que deseja deletar este produto?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Todos os dados relacionados a
              este produto serão perdidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductAction({ id: product.id })}
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

