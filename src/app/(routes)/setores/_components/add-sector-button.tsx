"use client"
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertSectorForm from "./upsert-sector-form";

const AddSectorButton = () => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus />
                    Adicionar setor
                </Button>
            </DialogTrigger>
            <UpsertSectorForm onSuccess={() => setIsOpen(false)} />
        </Dialog>
    );
}

export default AddSectorButton;