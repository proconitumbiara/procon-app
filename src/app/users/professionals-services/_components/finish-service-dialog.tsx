"use client"

import { BadgeCheck } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { endService } from "@/actions/end-service";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface FinishServiceDialogProps {
    treatmentId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const FinishServiceDialog = ({ treatmentId, open, onOpenChange }: FinishServiceDialogProps) => {
    const [processNumber, setProcessNumber] = useState<string>("");
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
            setProcessNumber("");
            onOpenChange(false);
        },
        onError: (error) => {
            const msg = error.error?.serverError || error.error?.validationErrors?.treatmentId?._errors?.[0] || "Erro ao finalizar atendimento";
            toast.error(msg);
            setError(msg);
        },
    });

    const handleFinishService = () => {
        if (!processNumber.trim()) {
            toast.error("Por favor, informe um número de processo válido");
            return;
        }

        execute({
            treatmentId,
            processNumber: processNumber.trim()
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BadgeCheck className="w-5 h-5" />
                        Finalizar Atendimento
                    </DialogTitle>
                    <DialogDescription>
                        Para finalizar o atendimento, é obrigatório informar o número do processo.
                    </DialogDescription>
                </DialogHeader>

                <div>
                    <Input
                        id="processNumber"
                        type="text"
                        value={processNumber}
                        onChange={(e) => setProcessNumber(e.target.value)}
                        className="col-span-3"
                        placeholder="Digite o número do processo"
                    />
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={status === "executing"}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleFinishService}
                        disabled={status === "executing" || !processNumber}
                    >
                        {status === "executing" ? "Finalizando..." : "Finalizar Atendimento"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FinishServiceDialog;
