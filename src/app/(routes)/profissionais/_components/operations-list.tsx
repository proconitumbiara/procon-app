"use client";

import { ChevronDown, ChevronRight, Clock, Pause, Users } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatDateInSaoPaulo } from "@/lib/timezone-utils";

interface Operation {
  id: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  finishedAt: Date | string | null;
  treatments: Array<{
    id: string;
    duration: number | null;
    status: string;
    startedAt?: Date | string | null;
    finishedAt?: Date | string | null;
  }>;
  pauses: Array<{
    id: string;
    reason: string;
    duration: number;
    createdAt: Date | string;
  }>;
}

interface OperationsListProps {
  operations: Operation[];
}

const OperationsList = ({ operations }: OperationsListProps) => {
  const [expandedOperations, setExpandedOperations] = useState<Set<string>>(
    new Set(),
  );

  const [showAllOperations, setShowAllOperations] = useState(false);

  const toggleExpanded = (operationId: string) => {
    const newExpanded = new Set(expandedOperations);
    if (newExpanded.has(operationId)) {
      newExpanded.delete(operationId);
    } else {
      newExpanded.add(operationId);
    }
    setExpandedOperations(newExpanded);
  };

  const formatTime = (minutes: number) => {
    if (minutes <= 0) {
      return `~1min`;
    }
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatDate = (date: Date | string) => {
    return formatDateInSaoPaulo(date, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateOperationDuration = (operation: Operation) => {
    const start =
      operation.createdAt instanceof Date
        ? operation.createdAt
        : new Date(operation.createdAt);
    const end =
      operation.status === "finished" && operation.finishedAt
        ? operation.finishedAt instanceof Date
          ? operation.finishedAt
          : new Date(operation.finishedAt)
        : operation.updatedAt instanceof Date
          ? operation.updatedAt
          : new Date(operation.updatedAt);
    const durationMs = end.getTime() - start.getTime();
    return Math.round(durationMs / 60000); // em minutos
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "operating":
        return "bg-green-100 text-green-800";
      case "finished":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
      case "operating":
        return "Em operação";
      case "finished":
        return "Finalizada";
      case "paused":
        return "Pausada";
      default:
        return status;
    }
  };

  const sortedOperations = [...operations].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
  const list = showAllOperations ? sortedOperations : sortedOperations.slice(0, 20);

  if (operations.length === 0) {
    return (
      <Card className="mx-auto flex h-full w-full flex-col">
        <CardContent className="flex flex-1 flex-col">
          <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-muted-foreground h-5 w-5" />
              <CardTitle className="text-base sm:text-lg">Operações</CardTitle>
            </div>
            <CardDescription className="text-sm sm:text-base">
              Listagem de operações do profissional no período selecionado
            </CardDescription>
          </div>
          <div className="text-muted-foreground py-8 text-center text-sm">
            Nenhuma operação encontrada para este período.
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
            <Users className="text-muted-foreground h-5 w-5" />
            <CardTitle className="text-base sm:text-lg">
              Operações ({operations.length})
            </CardTitle>
          </div>
          <CardDescription className="text-sm sm:text-base">
            Listagem de operações do profissional no período selecionado
          </CardDescription>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {list.map((operation) => {
            const isExpanded = expandedOperations.has(operation.id);
            const duration = calculateOperationDuration(operation);
            const treatmentsCount = operation.treatments.length;

            return (
              <Collapsible
                key={operation.id}
                open={isExpanded}
                onOpenChange={() => toggleExpanded(operation.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-between gap-2 py-3 text-left"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      )}
                      <div className="flex w-full items-center justify-between">
                        <div className="truncate font-medium">
                          Operação #{operation.id.slice(-8)}
                        </div>
                        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                          <span className="flex items-center gap-1 border-r border-border pr-3">
                            {formatDate(operation.createdAt)}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(operation.status)}`}
                          >
                            {getStatusText(operation.status)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-border bg-muted/40 text-muted-foreground mt-0.5 mb-4 rounded-md border px-4 py-3 text-sm space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Atendimentos:</span>
                        <span>{treatmentsCount}</span>
                      </div>
                    </div>

                    {operation.treatments.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium">
                          Atendimentos realizados:
                        </h4>
                        <div className="space-y-1">
                          {operation.treatments.map((treatment) => {
                            const isFinished = treatment.status === "finished";
                            const startRef =
                              treatment.startedAt ?? operation.createdAt;
                            const duration =
                              treatment.duration ??
                              (isFinished &&
                                treatment.finishedAt &&
                                startRef
                                ? Math.round(
                                    (new Date(treatment.finishedAt).getTime() -
                                      new Date(startRef).getTime()) /
                                      60000
                                  )
                                : null);
                            return (
                              <div
                                key={treatment.id}
                                className="bg-background flex items-center justify-between rounded p-2 text-xs"
                              >
                                <span>Atendimento #{treatment.id.slice(-8)}</span>
                                <span className="text-muted-foreground">
                                  {duration != null
                                    ? formatTime(duration)
                                    : "Em andamento"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {operation.pauses && operation.pauses.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium flex items-center gap-2">
                          <Pause className="h-4 w-4" />
                          Pausas realizadas:
                        </h4>
                        <div className="space-y-1">
                          {operation.pauses
                            .sort((a, b) => {
                              const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                              const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                              return dateA.getTime() - dateB.getTime();
                            })
                            .map((pause) => (
                              <div
                                key={pause.id}
                                className="bg-background flex flex-col gap-1 rounded p-2 text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{pause.reason}</span>
                                  <span className="text-muted-foreground">
                                    {formatTime(pause.duration)}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
          {operations.length > 20 && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllOperations(!showAllOperations)}
              >
                {showAllOperations
                  ? "Ver menos"
                  : `Ver mais (${operations.length - 20} restantes)`}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationsList;
