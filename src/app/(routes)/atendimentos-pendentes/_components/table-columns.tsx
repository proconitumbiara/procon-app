"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

import UpdateTicketForm from "./update-ticket-form";

export type TicketTableRow = {
  id: string;
  status: string;
  priority: number;
  clientName: string;
  clientId: string;
  sectorName: string;
  sectorId: string;
  createdAt: Date;
};

const ActionsCell = ({ ticket }: { ticket: TicketTableRow }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Cancelar atendimento"
        disabled={ticket.status === "canceled"}
      >
        {ticket.status === "canceled" ? "Já cancelado" : "Cancelar"}
      </Button>
      {open && (
        <UpdateTicketForm ticket={ticket} onSuccess={() => setOpen(false)} />
      )}
    </Dialog>
  );
};

export const ticketsTableColumns: ColumnDef<TicketTableRow>[] = [
  {
    id: "clientName",
    accessorKey: "clientName",
    header: "Consumidor",
  },
  {
    id: "sectorName",
    accessorKey: "sectorName",
    header: "Setor",
  },
  {
    id: "priority",
    accessorKey: "priority",
    header: "Prioridade",
    cell: ({ row }) => {
      const priority = row.original.priority;
      const label = priority === 1 ? "Prioritário" : "Comum";
      const color =
        priority === 1
          ? "bg-purple-100 text-purple-800 border-purple-300"
          : "bg-gray-100 text-gray-800 border-gray-300";
      return <Badge className={color}>{label}</Badge>;
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let label = status;
      let color = "";
      if (status === "pending") {
        label = "Aguardando";
        color = "bg-yellow-100 text-yellow-800 border-yellow-300";
      } else if (status === "in-attendance") {
        label = "Em atendimento";
        color = "bg-blue-100 text-blue-800 border-blue-300";
      } else if (status === "canceled") {
        label = "Cancelado";
        color = "bg-red-100 text-red-800 border-red-300";
      } else if (status === "finished") {
        label = "Atendido";
        color = "bg-green-100 text-green-800 border-green-300";
      }
      return <Badge className={color}>{label}</Badge>;
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Data",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return date ? new Date(date).toLocaleString("pt-BR") : "-";
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => <ActionsCell ticket={row.original} />,
  },
];
