"use client"
import { BadgeCheck } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { finishOperation } from "@/actions/operations/finish-operation";
import { Button } from "@/components/ui/button";

interface FinishOperationButtonProps {
    operationId: string;
}

const FinishOperationButton = ({ operationId }: FinishOperationButtonProps) => {
    const [, setError] = useState<string | null>(null);
    const { execute, status } = useAction(finishOperation, {
        onSuccess: (result) => {
            if (result.data?.error) {
                toast.error(result.data.error.message);
                setError(result.data.error.message);
                return;
            }
            toast.success("Operação encerrada com sucesso!");
            setError(null);
        },
        onError: (err) => {
            const msg = err.error?.serverError || err.error?.validationErrors?.operationId?._errors?.[0] || "Erro ao encerrar operação";
            toast.error(msg);
            setError(msg);
        },
    });

    return (
        <Button
            variant="default"
            disabled={status === "executing"}
            onClick={() => execute({ operationId })}
        >
            <BadgeCheck className="w-4 h-4" />
            Finalizar operação
        </Button>
    );
};

export default FinishOperationButton;