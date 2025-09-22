"use client"
import { BadgeCheck } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { endService } from "@/actions/end-service";
import { Button } from "@/components/ui/button"

interface FinishServiceButtonProps {
    treatmentId: string;
}

const FinishServiceButton = ({ treatmentId }: FinishServiceButtonProps) => {
    const [, setError] = useState<string | null>(null);
    const { execute, status } = useAction(endService, {
        onSuccess: (result) => {
            if (result.data?.error) {
                toast.error(result.data.error.message);
                setError(result.data.error.message);
                return;
            }
            toast.success("Atendimento finalizado com sucesso!");
            setError(null);
        },
        onError: (error) => {
            const msg = error.error?.serverError || error.error?.validationErrors?.treatmentId?._errors?.[0] || "Erro ao finalizar atendimento";
            toast.error(msg);
            setError(msg);
        },
    });

    return (
        <Button
            variant="default"
            disabled={status === "executing"}
            onClick={() => execute({ treatmentId })}
        >
            <BadgeCheck className="w-4 h-4" />
            Finalizar atendimento
        </Button>
    );
}

export default FinishServiceButton;