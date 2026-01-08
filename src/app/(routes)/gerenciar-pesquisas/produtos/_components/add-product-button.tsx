"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { categoriesTable } from "@/db/schema";

import UpsertProductForm from "./upsert-product-form";

type Category = typeof categoriesTable.$inferSelect;

interface AddProductButtonProps {
  categories: Category[];
}

const AddProductButton = ({ categories }: AddProductButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Novo produto
        </Button>
      </DialogTrigger>
      <UpsertProductForm
        categories={categories}
        onSuccess={() => setOpen(false)}
      />
    </Dialog>
  );
};

export default AddProductButton;

