"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertSupplierForm from "./upsert-supplier-form";

const AddSupplierButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Novo fornecedor
        </Button>
      </DialogTrigger>
      <UpsertSupplierForm onSuccess={() => setOpen(false)} />
    </Dialog>
  );
};

export default AddSupplierButton;

