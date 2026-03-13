"use client";

import { ChevronDown, ChevronRight, ClipboardList, Clock, Hourglass } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatDateInSaoPaulo } from "@/lib/timezone-utils";

export type DashboardTreatment = {
  id: string;
  clientName: string;
  sectorName: string;
  ticketCreatedAt: string | Date | null;
  ticketCalledAt: string | Date | null;
  ticketFinishedAt: string | Date | null;
  ticketStatus: string | null;
  durationMinutes: number | null;
  treatmentStartedAt: string | Date | null;
  treatmentFinishedAt: string | Date | null;
  treatmentStatus: string;
  professionalName: string;
  servicePointName: string;
  waitingTimeMinutes: number | null;
};

interface TreatmentsListProps {
  treatments: DashboardTreatment[];
}

function formatDuration(minutes: number | null): string {
  if (minutes == null || minutes < 0) return "-";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  return formatDateInSaoPaulo(date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: string | null): string {
  if (!status) return "-";
  if (status === "pending") return "Aguardando";
  if (status === "in-attendance") return "Em atendimento";
  if (status === "finished") return "Finalizado";
  if (status === "cancelled") return "Cancelado";
  if (status === "in_service") return "Em atendimento";
  return status;
}

export default function TreatmentsList({ treatments }: TreatmentsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const list = showAll ? treatments : treatments.slice(0, 20);

  return (
    <Card className="mx-auto flex h-full w-full flex-col">
      <CardContent className="flex flex-1 flex-col">
        <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-muted-foreground h-5 w-5" />
            <CardTitle className="text-base sm:text-lg">
              Atendimentos no período
            </CardTitle>
          </div>
          <CardDescription className="text-sm sm:text-base">
            Listagem de todos os atendimentos no período selecionado
          </CardDescription>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {treatments.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">
              Nenhum atendimento no período selecionado.
            </div>
          ) : (
            list.map((t) => {
              const isOpen = expandedId === t.id;
              return (
                <Collapsible
                  key={t.id}
                  open={isOpen}
                  onOpenChange={() => toggle(t.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-auto w-full justify-between gap-2 py-3 text-left"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0" />
                        )}
                        <div className="w-full flex items-center justify-between">
                          <div className="truncate font-medium">
                            {t.clientName}
                          </div>
                          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">

                            <span className="flex items-center gap-1 border-r border-border pr-3">
                              Tempo de atendimento:
                              <span>
                                {formatDuration(t.durationMinutes)}
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              Tempo de espera:
                              <span>
                                {t.waitingTimeMinutes != null
                                  ? `${t.waitingTimeMinutes} min`
                                  : "-"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-border bg-muted/40 text-muted-foreground mt-0.5 mb-4 rounded-md border px-4 py-3 text-sm">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <span className="font-medium text-foreground">
                            Setor:
                          </span>{" "}
                          {t.sectorName}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">
                            Ponto de serviço:
                          </span>{" "}
                          {t.servicePointName}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">
                            Profissional:
                          </span>{" "}
                          {t.professionalName}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">
                            Status do ticket:
                          </span>{" "}
                          {getStatusLabel(t.ticketStatus)}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">
                            Status do atendimento:
                          </span>{" "}
                          {getStatusLabel(t.treatmentStatus)}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">
                            Ticket criado em:
                          </span>{" "}
                          {formatDate(t.ticketCreatedAt)}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">
                            Chamado em:
                          </span>{" "}
                          {formatDate(t.ticketCalledAt)}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">
                            Início do atendimento:
                          </span>{" "}
                          {formatDate(t.treatmentStartedAt)}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">
                            Finalizado em:
                          </span>{" "}
                          {formatDate(t.ticketFinishedAt ?? t.treatmentFinishedAt)}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">
                            Duração do atendimento:
                          </span>{" "}
                          {formatDuration(t.durationMinutes)}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">
                            Tempo de espera:
                          </span>{" "}
                          {t.waitingTimeMinutes != null
                            ? `${t.waitingTimeMinutes} min`
                            : "-"}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          )}
          {treatments.length > 20 && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll
                  ? "Ver menos"
                  : `Ver mais (${treatments.length - 20} restantes)`}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
