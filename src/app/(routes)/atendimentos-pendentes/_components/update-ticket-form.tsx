import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { updateTicket } from "@/actions/upsert-ticket";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";

interface UpdateTicketFormProps {
    ticket: { id: string; status: string; clientName: string; sectorName: string; clientId: string; sectorId: string };
    onSuccess?: () => void;
}

const UpdateTicketForm = ({ ticket, onSuccess }: UpdateTicketFormProps) => {
    const { execute: executeUpdateTicket, status: updateStatus } = useAction(updateTicket, {
        onSuccess: () => {
            toast.success("Ticket cancelado com sucesso!");
            onSuccess?.();
        },
        onError: (error) => {
            toast.error("Erro ao cancelar ticket.");
            console.log(error);
        },
    });

    const isPending = updateStatus === "executing";
    const isCanceled = ticket.status === "canceled";

    const handleConfirm = () => {
        executeUpdateTicket({ id: ticket.id });
    };

    return (
        <DialogContent>
            <DialogTitle>Cancelar Ticket</DialogTitle>
            <DialogDescription>
                Tem certeza que deseja cancelar o ticket deste consumidor?
            </DialogDescription>
            <div className="text-sm text-muted-foreground">
                <p>Consumidor: {ticket.clientName}</p>
                <p>Setor: {ticket.sectorName}</p>
            </div>
            <DialogFooter>
                <Button onClick={handleConfirm} disabled={isPending || isCanceled} variant="default">
                    {isPending ? "Cancelando..." : isCanceled ? "Já cancelado" : "Confirmar cancelamento"}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default UpdateTicketForm;