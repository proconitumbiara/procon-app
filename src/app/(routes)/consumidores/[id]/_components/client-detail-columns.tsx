"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { TicketWaitTime } from "@/components/ticket-wait-time";

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

export type ClientTicketRow = {
  id: string;
  status: string;
  priority: number;
  sectorName: string;
  sectorId: string;
  createdAt: Date;
  calledAt: Date | null;
  finishedAt: Date | null;
  servicePointName: string | null;
  professionalName: string | null;
  treatmentDuration: number | null;
  treatmentStatus: string | null;
};

export const clientDetailTableColumns: ColumnDef<ClientTicketRow>[] = [
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
      if (t.treatmentDuration != null) {
        return formatDurationMs(t.treatmentDuration * 1000);
      }
      if (t.status !== "finished" || !t.calledAt || !t.finishedAt) return "-";
      const ms =
        new Date(t.finishedAt).getTime() - new Date(t.calledAt).getTime();
      return formatDurationMs(ms);
    },
  },
  {
    id: "servicePointName",
    accessorKey: "servicePointName",
    header: "Ponto de serviço",
    cell: ({ row }) => row.original.servicePointName ?? "-",
  },
  {
    id: "professionalName",
    accessorKey: "professionalName",
    header: "Profissional",
    cell: ({ row }) => row.original.professionalName ?? "-",
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Criado em",
    cell: ({ row }) =>
      row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleString("pt-BR")
        : "-",
  },
  {
    id: "calledAt",
    accessorKey: "calledAt",
    header: "Chamado em",
    cell: ({ row }) =>
      row.original.calledAt
        ? new Date(row.original.calledAt).toLocaleString("pt-BR")
        : "-",
  },
  {
    id: "finishedAt",
    accessorKey: "finishedAt",
    header: "Finalizado em",
    cell: ({ row }) =>
      row.original.finishedAt
        ? new Date(row.original.finishedAt).toLocaleString("pt-BR")
        : "-",
  },
];
