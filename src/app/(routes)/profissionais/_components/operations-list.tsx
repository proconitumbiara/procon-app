"use client";

import { ChevronDown, ChevronRight, Clock, Pause, Users } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatDateInSaoPaulo } from "@/lib/timezone-utils";

interface Operation {
  id: string;
  status: string;
  createdAT: Date | string;
  updatedAt: Date | string;
  treatments: Array<{
    id: string;
    duration: number | null;
    status: string;
  }>;
  pauses: Array<{
    id: string;
    duration: number | null;
    reason: string;
    status: string;
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
      operation.createdAT instanceof Date
        ? operation.createdAT
        : new Date(operation.createdAT);
    const end =
      operation.updatedAt instanceof Date
        ? operation.updatedAt
        : new Date(operation.updatedAt);
    const durationMs = end.getTime() - start.getTime();
    return Math.round(durationMs / 60000); // em minutos
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getReasonText = (reason: string) => {
    switch (reason.toLowerCase()) {
      case "lunch":
        return "Almoço";
      case "break":
        return "Intervalo";
      case "meeting":
        return "Reunião";
      case "personal":
        return "Pessoal";
      case "technical":
        return "Técnico";
      case "finished-service":
        return "Atendimento Finalizado";
      case "other":
        return "Outro";
      default:
        return reason.charAt(0).toUpperCase() + reason.slice(1);
    }
  };

  if (operations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Operações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-4 text-center">
            Nenhuma operação encontrada para este período.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Operações ({operations.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {operations
          .sort((a, b) => {
            const dateA =
              a.createdAT instanceof Date ? a.createdAT : new Date(a.createdAT);
            const dateB =
              b.createdAT instanceof Date ? b.createdAT : new Date(b.createdAT);
            return dateB.getTime() - dateA.getTime(); // Mais novo primeiro
          })
          .slice(0, showAllOperations ? undefined : 20)
          .map((operation) => {
            const isExpanded = expandedOperations.has(operation.id);
            const duration = calculateOperationDuration(operation);
            const treatmentsCount = operation.treatments.length;
            const pausesCount = operation.pauses.length;

            return (
              <Collapsible
                key={operation.id}
                open={isExpanded}
                onOpenChange={() => toggleExpanded(operation.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div className="text-left">
                        <div className="font-medium">
                          Operação #{operation.id.slice(-8)}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {formatDate(operation.createdAT)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(operation.status)}`}
                      >
                        {getStatusText(operation.status)}
                      </span>
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        {formatTime(duration)}
                      </div>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <div className="bg-muted/50 space-y-3 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Atendimentos:</span>
                        <span>{treatmentsCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pause className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">Pausas:</span>
                        <span>{pausesCount}</span>
                      </div>
                    </div>

                    {operation.treatments.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium">
                          Atendimentos realizados:
                        </h4>
                        <div className="space-y-1">
                          {operation.treatments.map((treatment) => (
                            <div
                              key={treatment.id}
                              className="bg-background flex items-center justify-between rounded p-2 text-xs"
                            >
                              <span>Atendimento #{treatment.id.slice(-8)}</span>
                              <span className="text-muted-foreground">
                                {treatment.duration
                                  ? formatTime(treatment.duration)
                                  : "Em andamento"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {operation.pauses.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium">
                          Pausas realizadas:
                        </h4>
                        <div className="space-y-1">
                          {operation.pauses.map((pause) => (
                            <div
                              key={pause.id}
                              className="bg-background flex items-center justify-between rounded p-2 text-xs"
                            >
                              <span className="capitalize">
                                {getReasonText(pause.reason)}
                              </span>
                              <span className="text-muted-foreground">
                                {pause.duration
                                  ? formatTime(pause.duration)
                                  : "Em andamento"}
                              </span>
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
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAllOperations(!showAllOperations)}
            >
              {showAllOperations
                ? "Ver menos"
                : `Ver mais (${operations.length - 20} restantes)`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OperationsList;
