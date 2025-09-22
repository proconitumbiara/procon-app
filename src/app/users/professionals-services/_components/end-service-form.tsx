import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { endService } from "@/actions/end-service";
import { updateTicket } from "@/actions/upsert-ticket";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";

interface EndServiceFormProps {
    ticket: { id: string };
    treatment: { id: string };
    onSuccess?: () => void;
}

const EndServiceForm = ({ ticket, treatment, onSuccess }: EndServiceFormProps) => {
    const { execute: executeUpdateTicket, status: updateTicketStatus } = useAction(updateTicket, {
        onSuccess: () => {
            executeEndService({ treatmentId: treatment.id });
        },
        onError: (error) => {
            toast.error("Erro ao cancelar ticket.");
            console.log(error);
        },
    });

    const { execute: executeEndService, status: endServiceStatus } = useAction(endService, {
        onSuccess: () => {
            toast.success("Ticket cancelado e atendimento encerrado com sucesso!");
            onSuccess?.();
        },
        onError: (error) => {
            toast.error("Erro ao encerrar serviço.");
            console.log(error);
        },
    });

    const isPending = updateTicketStatus === "executing" || endServiceStatus === "executing";

    const handleConfirm = () => {
        executeUpdateTicket({ id: ticket.id });
    };

    return (
        <DialogContent>
            <DialogTitle>Deseja cancelar o ticket deste consumidor e encerrar o atendimento?</DialogTitle>
            <DialogDescription>
                Caso o consumidor não tenha chegado ainda, você pode cancelar o ticket e encerrar o atendimento.
            </DialogDescription>
            <DialogFooter>
                <Button type="button" onClick={onSuccess} disabled={isPending} variant="outline">
                    Não, manter o ticket e o atendimento
                </Button>
                <Button onClick={handleConfirm} disabled={isPending} variant="default">
                    {isPending ? "Processando..." : "Sim, encerrar"}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default EndServiceForm; 