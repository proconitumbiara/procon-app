import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { cancelTreatmentAndTicket } from "@/actions/treatments/cancel-treatment-and-ticket";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";

interface EndServiceFormProps {
    ticket: { id: string };
    treatment: { id: string };
    onSuccess?: () => void;
}

const EndServiceForm = ({ ticket, treatment, onSuccess }: EndServiceFormProps) => {
    const { execute, status } = useAction(cancelTreatmentAndTicket, {
        onSuccess: (result) => {
            if (result.data?.error) {
                toast.error(result.data.error.message);
                return;
            }
            toast.success("Ticket cancelado e atendimento encerrado com sucesso!");
            onSuccess?.();
        },
        onError: (error) => {
            const msg = error.error?.serverError || error.error?.validationErrors?.treatmentId?._errors?.[0] || "Erro ao cancelar atendimento";
            toast.error(msg);
        },
    });

    const handleConfirm = () => {
        execute({
            treatmentId: treatment.id,
            ticketId: ticket.id
        });
    };

    return (
        <DialogContent>
            <DialogTitle>Deseja cancelar o ticket deste consumidor e encerrar o atendimento?</DialogTitle>
            <DialogDescription>
                Caso o consumidor não tenha chegado ainda, você pode cancelar o ticket e encerrar o atendimento.
            </DialogDescription>
            <DialogFooter>
                <Button type="button" onClick={onSuccess} disabled={status === "executing"} variant="outline">
                    Não, manter o ticket e o atendimento
                </Button>
                <Button onClick={handleConfirm} disabled={status === "executing"} variant="default">
                    {status === "executing" ? "Processando..." : "Sim, encerrar"}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default EndServiceForm; 