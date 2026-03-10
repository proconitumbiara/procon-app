"use client"
import { SmilePlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import StartOperationForm from "./start-operation-form";

interface StartOperationButtonProps {
    sectors: {
        id: string;
        name: string;
        servicePoints: { id: string; name: string }[];
    }[];
    disabled?: boolean;
}

const StartOperationButton = ({ sectors, disabled }: StartOperationButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button disabled={disabled} variant="default">
                    <SmilePlus />
                    Iniciar operação
                </Button>
            </DialogTrigger>
            <StartOperationForm
                sectors={sectors}
                onSuccess={() => setIsOpen(false)}
            />
        </Dialog>
    );
}

export default StartOperationButton;