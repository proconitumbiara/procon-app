"use client";

import { ChevronDown, ChevronRight, Clock, Pause } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatDateInSaoPaulo } from "@/lib/timezone-utils";

export interface PauseItem {
  id: string;
  reason: string;
  duration: number;
  status: string;
  createdAt: Date | string;
  finishedAt: Date | string | null;
  operationId: string;
  operationCreatedAt: Date | string;
}

interface PausesListProps {
  pauses: PauseItem[];
}

const PausesList = ({ pauses }: PausesListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatTime = (minutes: number) => {
    if (minutes <= 0) return "~1min";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return formatDateInSaoPaulo(date, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-amber-100 text-amber-800";
      case "finished":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress":
        return "Em andamento";
      case "finished":
        return "Finalizada";
      default:
        return status;
    }
  };

  const sortedPauses = [...pauses].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
  const list = showAll ? sortedPauses : sortedPauses.slice(0, 20);

  if (pauses.length === 0) {
    return (
      <Card className="mx-auto flex h-full w-full flex-col">
        <CardContent className="flex flex-1 flex-col">
          <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Pause className="text-muted-foreground h-5 w-5" />
              <CardTitle className="text-base sm:text-lg">Pausas</CardTitle>
            </div>
            <CardDescription className="text-sm sm:text-base">
              Listagem de pausas do profissional no período selecionado
            </CardDescription>
          </div>
          <div className="text-muted-foreground py-8 text-center text-sm">
            Nenhuma pausa encontrada para este período.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto flex h-full w-full flex-col">
      <CardContent className="flex flex-1 flex-col">
        <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Pause className="text-muted-foreground h-5 w-5" />
            <CardTitle className="text-base sm:text-lg">
              Pausas ({pauses.length})
            </CardTitle>
          </div>
          <CardDescription className="text-sm sm:text-base">
            Listagem de pausas do profissional no período selecionado
          </CardDescription>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {list.map((pause) => {
            const isOpen = expandedId === pause.id;
            return (
              <Collapsible
                key={pause.id}
                open={isOpen}
                onOpenChange={() => toggle(pause.id)}
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
                      <div className="flex w-full items-center justify-between">
                        <div className="truncate font-medium">
                          {pause.reason}
                        </div>
                        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                          <span className="flex items-center gap-1 border-r border-border pr-3">
                            {formatDate(pause.createdAt)}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(pause.status)}`}
                          >
                            {getStatusText(pause.status)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(pause.duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-border bg-muted/40 text-muted-foreground mt-0.5 mb-4 rounded-md border px-4 py-3 text-sm space-y-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <span className="font-medium text-foreground">Motivo:</span>{" "}
                        {pause.reason}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Duração:</span>{" "}
                        {formatTime(pause.duration)}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Status:</span>{" "}
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(pause.status)}`}
                        >
                          {getStatusText(pause.status)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Operação:</span>{" "}
                        Operação #{pause.operationId.slice(-8)}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Início da pausa:</span>{" "}
                        {formatDate(pause.createdAt)}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Fim da pausa:</span>{" "}
                        {formatDate(pause.finishedAt)}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
          {pauses.length > 20 && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Ver menos" : `Ver mais (${pauses.length - 20} restantes)`}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PausesList;
