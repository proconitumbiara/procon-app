"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TicketWaitTime } from "@/components/ticket-wait-time";

import type { TicketTableRow } from "./table-columns";
import UpdateTicketForm from "./update-ticket-form";
import { Separator } from "@/components/ui/separator";

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
  if (status === "pending") return "bg-yellow-100 text-yellow-800 border-yellow-300";
  if (status === "in-attendance") return "bg-blue-100 text-blue-800 border-blue-300";
  if (status === "cancelled") return "bg-red-100 text-red-800 border-red-300";
  if (status === "finished") return "bg-green-100 text-green-800 border-green-300";
  return "";
}

function getPriorityLabel(priority: number) {
  return priority === 1 ? "Prioritário" : "Comum";
}

function getPriorityColor(priority: number) {
  return priority === 1
    ? "bg-transparent text-muted-foreground border-none"
    : "bg-transparent text-muted-foreground border-none";
}

interface TicketsCardsProps {
  tickets: TicketTableRow[];
}

export default function TicketsCards({ tickets }: TicketsCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}

function TicketCard({ ticket }: { ticket: TicketTableRow }) {
  const [open, setOpen] = useState(false);
  const canCancel = ticket.status !== "cancelled" && ticket.status !== "finished";
  const serviceDuration =
    ticket.status === "finished" && ticket.calledAt && ticket.finishedAt
      ? formatDurationMs(
        new Date(ticket.finishedAt).getTime() -
        new Date(ticket.calledAt).getTime()
      )
      : null;

  return (
    <Card className="border shadow-sm relative">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col items-start gap-2">
            <p className="font-medium truncate" title={ticket.clientName}>
              {ticket.clientName}
            </p>
            <p className={`text-sm ${getPriorityColor(ticket.priority)}`}>
              <span className="text-muted-foreground">Prioridade: </span>
              {getPriorityLabel(ticket.priority)}
            </p>
          </div>
          <Badge variant="outline" className={getStatusColor(ticket.status)}>
            {getStatusLabel(ticket.status)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Setor: {ticket.sectorName}</p>

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
            <span className="text-muted-foreground">Duração do atendimento: </span>
            {serviceDuration}
          </p>
        )}

        <Separator className="my-4" />
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
            {ticket.status === "cancelled"
              ? <>Cancelado em: {new Date(ticket.finishedAt).toLocaleString("pt-BR")}</>
              : ticket.status === "finished"
                ? <>Finalizado em: {new Date(ticket.finishedAt).toLocaleString("pt-BR")}</>
                : null}
          </p>
        )}
        <Dialog open={open} onOpenChange={setOpen} >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={!canCancel}
              aria-label="Cancelar atendimento"
              className="absolute bottom-4 right-4"
            >
              {ticket.status === "cancelled"
                ? "Já cancelado"
                : ticket.status === "finished"
                  ? "Atendido"
                  : "Cancelar"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <UpdateTicketForm ticket={ticket} onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
