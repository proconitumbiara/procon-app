import { EditIcon, TicketPlus } from "lucide-react";
import { useState } from "react";

import {} from "@/components/ui/alert-dialog";
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
    <div className="flex items-center gap-2">
      <Dialog open={upsertDialogIsOpen} onOpenChange={setUpsertDialogOpen}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setUpsertDialogOpen(true)}
          className="gap-2"
          aria-label={`Editar ${client.name}`}
        >
          <EditIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Editar</span>
        </Button>
        <UpsertClientForm
          client={client}
          onSuccess={() => setUpsertDialogOpen(false)}
        />
      </Dialog>
      <Dialog
        open={createTicketDialogIsOpen}
        onOpenChange={setCreateTicketDialogOpen}
      >
        <Button
          variant="default"
          size="sm"
          onClick={() => setCreateTicketDialogOpen(true)}
          className="gap-2"
          aria-label={`Criar ticket para ${client.name}`}
        >
          <TicketPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Criar ticket</span>
        </Button>
        {createTicketDialogIsOpen && (
          <CreateTicketForm
            clientId={client.id}
            sectors={sectors}
            onSuccess={() => setCreateTicketDialogOpen(false)}
          />
        )}
      </Dialog>
    </div>
  );
};

export default TableClientActions;
