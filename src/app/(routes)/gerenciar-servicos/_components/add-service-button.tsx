"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertServiceForm from "./upsert-service-form";

const AddServiceButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Novo serviço
        </Button>
      </DialogTrigger>
      <UpsertServiceForm onSuccess={() => setOpen(false)} />
    </Dialog>
  );
};

export default AddServiceButton;

