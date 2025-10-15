"use client"
import { BadgeCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import FinishServiceDialog from "./finish-service-dialog";

interface FinishServiceButtonProps {
    treatmentId: string;
    ticketId: string;
}

const FinishServiceButton = ({ treatmentId, ticketId }: FinishServiceButtonProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <Button
                variant="default"
                onClick={() => setDialogOpen(true)}
            >
                <BadgeCheck className="w-4 h-4" />
                Finalizar atendimento
            </Button>

            <FinishServiceDialog
                treatmentId={treatmentId}
                ticketId={ticketId}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </>
    );
}

export default FinishServiceButton;