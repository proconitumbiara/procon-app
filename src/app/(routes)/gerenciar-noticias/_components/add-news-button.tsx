"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertNewsForm from "./upsert-news-form";

const AddNewsButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Nova notícia
        </Button>
      </DialogTrigger>
      <UpsertNewsForm onSuccess={() => setOpen(false)} />
    </Dialog>
  );
};

export default AddNewsButton;

