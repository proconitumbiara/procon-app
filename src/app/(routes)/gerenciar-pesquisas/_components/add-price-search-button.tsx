"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { categoriesTable, suppliersTable } from "@/db/schema";

import UpsertPriceSearchForm from "./upsert-price-search-form";

type Supplier = typeof suppliersTable.$inferSelect;
type Category = typeof categoriesTable.$inferSelect;

interface AddPriceSearchButtonProps {
  suppliers: Supplier[];
  categories: Category[];
}

const AddPriceSearchButton = ({
  suppliers,
  categories,
}: AddPriceSearchButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Nova pesquisa
        </Button>
      </DialogTrigger>
      <UpsertPriceSearchForm
        suppliers={suppliers}
        categories={categories}
        onSuccess={() => setOpen(false)}
      />
    </Dialog>
  );
};

export default AddPriceSearchButton;


