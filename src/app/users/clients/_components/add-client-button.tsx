"use client"
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertClientForm from "./upsert-client-form";

const AddClientButton = () => {

    const [isOpen, setIsOpen] = useState(false);
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="default">
                    <Plus />
                    Cadastrar consumidor
                </Button>
            </DialogTrigger>
            <UpsertClientForm onSuccess={() => setIsOpen(false)} />
        </Dialog>
    );
}

export default AddClientButton;