"use client";

import { Loader2, Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { upsertCategory } from "@/actions/upsert-category";
import { upsertProduct } from "@/actions/upsert-product";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoriesTable, productsTable } from "@/db/schema";

type Product = typeof productsTable.$inferSelect & {
  category: typeof categoriesTable.$inferSelect;
};
type Category = typeof categoriesTable.$inferSelect;

interface UpsertProductFormProps {
  product?: Product;
  categories: Category[];
  onSuccess?: () => void;
}

const UpsertProductForm = ({
  product,
  categories: initialCategories,
  onSuccess,
}: UpsertProductFormProps) => {
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [categories, setCategories] = useState(initialCategories);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const { execute, status } = useAction(upsertProduct, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        return;
      }
      toast.success(
        product
          ? "Produto atualizado com sucesso!"
          : "Produto criado com sucesso!",
      );
      onSuccess?.();
      window.location.reload();
    },
    onError: () => {
      toast.error("Erro ao salvar produto.");
    },
  });

  const { execute: saveCategory, status: categoryStatus } = useAction(
    upsertCategory,
    {
      onSuccess: (result) => {
        if (result.data?.error) {
          toast.error(result.data.error.message);
          return;
        }
        if (result.data?.category) {
          const newCategory = result.data.category;
          setCategories((prev) => [
            ...prev,
            { ...newCategory, createdAT: new Date(), updatedAt: new Date() },
          ]);
          setCategoryId(newCategory.id);
          setShowNewCategoryInput(false);
          setNewCategoryName("");
          toast.success("Categoria criada com sucesso!");
        }
      },
      onError: () => {
        toast.error("Erro ao salvar categoria.");
      },
    },
  );

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Informe o nome do produto.");
      return;
    }
    if (!categoryId) {
      toast.error("Selecione uma categoria.");
      return;
    }
    execute({
      id: product?.id,
      name: name.trim(),
      categoryId,
    });
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Informe o nome da categoria.");
      return;
    }
    saveCategory({ name: newCategoryName.trim() });
  };

  return (
    <DialogContent className="flex h-[95vh] w-[95vw] max-w-[95vw] flex-col p-0 md:w-[98vw] md:max-w-[98vw] lg:w-[50vw] lg:max-w-[50vw]">
      <div className="border-b px-6 pt-6 pb-4">
        <DialogTitle>{product ? "Editar produto" : "Novo produto"}</DialogTitle>
        <DialogDescription>
          {product
            ? "Atualize os dados do produto."
            : "Cadastre um novo produto no catálogo."}
        </DialogDescription>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome</label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do produto"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Categoria</label>
            <div className="mt-1 flex gap-2">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!showNewCategoryInput ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowNewCategoryInput(true)}
                  title="Criar nova categoria"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex flex-1 gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome da categoria"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateCategory();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateCategory}
                    disabled={categoryStatus === "executing"}
                  >
                    {categoryStatus === "executing" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategoryName("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t px-6 pt-4 pb-6">
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
            ) : product ? (
              "Atualizar"
            ) : (
              "Criar"
            )}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
};

export default UpsertProductForm;
