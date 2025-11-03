import { EditIcon, MessageCirclePlus } from "lucide-react";
import { useState } from "react";

import {
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { clientsTable } from "@/db/schema";

import CreateTicketForm from "./create-ticket-form";
import UpsertClientForm from "./upsert-client-form";

interface ClientsTableActionsProps {
    client: typeof clientsTable.$inferSelect;
    sectors: { id: string; name: string }[];
}

const TableClientActions = ({ client, sectors }: ClientsTableActionsProps) => {
    const [upsertDialogIsOpen, setUpsertDialogOpen] = useState(false);
    const [createTicketDialogIsOpen, setCreateTicketDialogOpen] = useState(false);

    return (
        <>
            <Dialog open={upsertDialogIsOpen} onOpenChange={setUpsertDialogOpen}>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUpsertDialogOpen(true)}
                    aria-label={`Editar ${client.name}`}
                >
                    <EditIcon className="w-6 h-6" />
                </Button>
                <UpsertClientForm
                    client={client}
                    onSuccess={() => setUpsertDialogOpen(false)}
                />
            </Dialog>
            <Dialog open={createTicketDialogIsOpen} onOpenChange={setCreateTicketDialogOpen}>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCreateTicketDialogOpen(true)}
                    aria-label={`Criar ticket para ${client.name}`}
                >
                    <MessageCirclePlus className="w-6 h-6" />
                </Button>
                {createTicketDialogIsOpen && (
                    <CreateTicketForm
                        clientId={client.id}
                        sectors={sectors}
                        onSuccess={() => setCreateTicketDialogOpen(false)}
                    />
                )}
            </Dialog>
        </>
    );
}

export default TableClientActions;