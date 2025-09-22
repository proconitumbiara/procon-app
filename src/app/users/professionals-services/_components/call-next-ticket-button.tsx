"use client"
import { SmilePlus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { callNextTicket } from "@/actions/call-next-client";
import { Button } from "@/components/ui/button";

interface CallNextTicketButtonProps {
    disabled?: boolean;
}

const CallNextTicketButton = ({ disabled }: CallNextTicketButtonProps) => {
    const [, setError] = useState<string | null>(null);
    const { execute, status } = useAction(callNextTicket, {
        onSuccess: (result) => {
            if (result.data?.error) {
                toast.error(result.data.error.message);
                setError(result.data.error.message);
                return;
            }
            toast.success("Atendimento iniciado com sucesso!");
            setError(null);
        },
        onError: (err) => {
            const msg = err.error?.serverError || (err.error?.validationErrors?.formErrors?.[0]) || "Erro ao iniciar atendimento";
            toast.error(msg);
            setError(msg);
        },
    });

    return (
        <div>
            <Button
                disabled={disabled || status === "executing"}
                variant="default"
                onClick={() => execute()}
            >
                <SmilePlus />
                {status === "executing" ? "Chamando..." : "Chamar próximo atendimento"}
            </Button>
        </div>
    );
};

export default CallNextTicketButton;