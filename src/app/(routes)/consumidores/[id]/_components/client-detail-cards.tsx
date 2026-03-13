"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TicketWaitTime } from "@/components/ticket-wait-time";

import type { ClientTicketRow } from "./client-detail-columns";

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

function getStatusLabel(status: string) {
  if (status === "pending") return "Aguardando";
  if (status === "in-attendance") return "Em atendimento";
  if (status === "cancelled") return "Cancelado";
  if (status === "finished") return "Atendido";
  return status;
}

function getStatusColor(status: string) {
  if (status === "pending")
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  if (status === "in-attendance")
    return "bg-blue-100 text-blue-800 border-blue-300";
  if (status === "cancelled") return "bg-red-100 text-red-800 border-red-300";
  if (status === "finished") return "bg-green-100 text-green-800 border-green-300";
  return "";
}

interface ClientDetailCardsProps {
  tickets: ClientTicketRow[];
}

export default function ClientDetailCards({ tickets }: ClientDetailCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tickets.map((ticket) => (
        <ClientTicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}

function ClientTicketCard({ ticket }: { ticket: ClientTicketRow }) {
  const serviceDuration =
    ticket.treatmentDuration != null
      ? formatDurationMs(ticket.treatmentDuration * 1000)
      : ticket.status === "finished" &&
          ticket.calledAt &&
          ticket.finishedAt
        ? formatDurationMs(
            new Date(ticket.finishedAt).getTime() -
              new Date(ticket.calledAt).getTime()
          )
        : null;

  return (
    <Card className="border shadow-sm">
      <CardContent className="space-y-2 p-4">
        <div className="flex justify-between gap-2">
          <p className="font-medium">{ticket.sectorName}</p>
          <Badge variant="outline" className={getStatusColor(ticket.status)}>
            {getStatusLabel(ticket.status)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Prioridade: {ticket.priority === 1 ? "Prioritário" : "Comum"}
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">Tempo de espera: </span>
          <TicketWaitTime
            status={ticket.status}
            createdAt={ticket.createdAt}
            calledAt={ticket.calledAt}
            finishedAt={ticket.finishedAt}
            live={true}
          />
        </p>
        {serviceDuration != null && (
          <p className="text-sm">
            <span className="text-muted-foreground">
              Duração do atendimento:{" "}
            </span>
            {serviceDuration}
          </p>
        )}
        {ticket.servicePointName && (
          <p className="text-sm text-muted-foreground">
            Ponto de serviço: {ticket.servicePointName}
          </p>
        )}
        {ticket.professionalName && (
          <p className="text-sm text-muted-foreground">
            Profissional: {ticket.professionalName}
          </p>
        )}
        <Separator className="my-2" />
        <p className="text-xs text-muted-foreground">
          Criado em: {new Date(ticket.createdAt).toLocaleString("pt-BR")}
        </p>
        {ticket.calledAt && (
          <p className="text-xs text-muted-foreground">
            Chamado em: {new Date(ticket.calledAt).toLocaleString("pt-BR")}
          </p>
        )}
        {ticket.finishedAt && (
          <p className="text-xs text-muted-foreground">
            Finalizado em: {new Date(ticket.finishedAt).toLocaleString("pt-BR")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
