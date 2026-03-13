"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { TicketWaitTime } from "@/components/ticket-wait-time";

import UpdateTicketForm from "./update-ticket-form";

function formatDurationMs(ms: number): string {
  if (ms < 0) return "-";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}min`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(" ");
}

export type TicketTableRow = {
  id: string;
  status: string;
  priority: number;
  clientName: string;
  clientId: string;
  sectorName: string;
  sectorId: string;
  createdAt: Date;
  calledAt: Date | null;
  finishedAt: Date | null;
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
        className="w-full"
        disabled={ticket.status === "cancelled" || ticket.status === "finished"}
      >
        {ticket.status === "cancelled" ? "Já cancelado" : ticket.status === "finished" ? "Atendido" : "Cancelar"}
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
      } else if (status === "cancelled") {
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
    id: "waitTime",
    header: "Tempo de espera",
    cell: ({ row }) => {
      const t = row.original;
      return (
        <TicketWaitTime
          status={t.status}
          createdAt={t.createdAt}
          calledAt={t.calledAt}
          finishedAt={t.finishedAt}
          live={true}
        />
      );
    },
  },
  {
    id: "serviceDuration",
    header: "Duração do atendimento",
    cell: ({ row }) => {
      const t = row.original;
      if (t.status !== "finished" || !t.calledAt || !t.finishedAt) return "-";
      const ms =
        new Date(t.finishedAt).getTime() - new Date(t.calledAt).getTime();
      return formatDurationMs(ms);
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Data de criação do ticket",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return date ? new Date(date).toLocaleString("pt-BR") : "-";
    },
  },
  {
    id: "calledAt",
    accessorKey: "calledAt",
    header: "Chamado em",
    cell: ({ row }) => {
      const date = row.original.calledAt;
      return date ? new Date(date).toLocaleString("pt-BR") : "-";
    },
  },
  {
    id: "finishedAt",
    accessorKey: "finishedAt",
    header: "Finalizado em",
    cell: ({ row }) => {
      const date = row.original.finishedAt;
      return date ? new Date(date).toLocaleString("pt-BR") : "-";
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => <ActionsCell ticket={row.original} />,
  },
];
