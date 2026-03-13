"use client";

import { ChevronDown, ChevronRight, ClipboardList } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatDateInSaoPaulo } from "@/lib/timezone-utils";

interface Treatment {
    id: string;
    duration: number | null;
    status: string;
    startedAt: Date | string | null;
    finishedAt: Date | string | null;
    clientName?: string;
    sectorName?: string;
    servicePointName?: string;
    ticketCreatedAt?: Date | string | null;
    ticketCalledAt?: Date | string | null;
    ticketFinishedAt?: Date | string | null;
    ticketStatus?: string | null;
    treatmentStartedAt?: Date | string | null;
    treatmentFinishedAt?: Date | string | null;
    waitingTimeMinutes?: number | null;
}

interface TreatmentsListProps {
    treatments: Treatment[];
}

const TreatmentsList = ({ treatments }: TreatmentsListProps) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);

    const toggle = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
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
            case 'in_service':
                return 'bg-green-100 text-green-800';
            case 'finished':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'in_service':
                return 'Em atendimento';
            case 'finished':
                return 'Finalizado';
            case 'cancelled':
                return 'Cancelado';
            default:
                return status;
        }
    };

    const getTicketStatusLabel = (status: string | null | undefined) => {
        if (!status) return "-";
        if (status === "pending") return "Aguardando";
        if (status === "in-attendance") return "Em atendimento";
        if (status === "finished") return "Finalizado";
        if (status === "cancelled") return "Cancelado";
        return status;
    };

    const formatDuration = (minutes: number | null): string => {
        if (minutes == null || minutes < 0) return "-";
        if (minutes < 60) return `${minutes} min`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m ? `${h}h ${m}min` : `${h}h`;
    };

    const sortedTreatments = [...treatments].sort((a, b) => {
        const dateA = a.startedAt ? new Date(a.startedAt).getTime() : 0;
        const dateB = b.startedAt ? new Date(b.startedAt).getTime() : 0;
        return dateB - dateA;
    });
    const list = showAll ? sortedTreatments : sortedTreatments.slice(0, 20);

    if (treatments.length === 0) {
        return (
            <Card className="mx-auto flex h-full w-full flex-col">
                <CardContent className="flex flex-1 flex-col">
                    <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <ClipboardList className="text-muted-foreground h-5 w-5" />
                            <CardTitle className="text-base sm:text-lg">
                                Atendimentos
                            </CardTitle>
                        </div>
                        <CardDescription className="text-sm sm:text-base">
                            Listagem de atendimentos do profissional no período selecionado
                        </CardDescription>
                    </div>
                    <div className="text-muted-foreground py-8 text-center text-sm">
                        Nenhum atendimento encontrado para este período.
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
                        <ClipboardList className="text-muted-foreground h-5 w-5" />
                        <CardTitle className="text-base sm:text-lg">
                            Atendimentos ({treatments.length})
                        </CardTitle>
                    </div>
                    <CardDescription className="text-sm sm:text-base">
                        Listagem de atendimentos do profissional no período selecionado
                    </CardDescription>
                </div>
                <div className="flex-1 space-y-1 overflow-y-auto">
                    {list.map((treatment) => {
                        const isOpen = expandedId === treatment.id;
                        return (
                            <Collapsible
                                key={treatment.id}
                                open={isOpen}
                                onOpenChange={() => toggle(treatment.id)}
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
                                                    {treatment.clientName ?? `Atendimento #${treatment.id.slice(-8)}`}
                                                </div>
                                                <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                                                    <span className="flex items-center gap-1 border-r border-border pr-3">
                                                        Tempo de atendimento:
                                                        <span>
                                                            {treatment.duration != null
                                                                ? formatDuration(treatment.duration)
                                                                : "Em andamento"}
                                                        </span>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        Tempo de espera:
                                                        <span>
                                                            {treatment.waitingTimeMinutes != null
                                                                ? `${treatment.waitingTimeMinutes} min`
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
                                                <span className="font-medium text-foreground">Setor:</span>{" "}
                                                {treatment.sectorName ?? "-"}
                                            </div>
                                            <div>
                                                <span className="font-medium text-foreground">Ponto de serviço:</span>{" "}
                                                {treatment.servicePointName ?? "-"}
                                            </div>
                                            <div>
                                                <span className="font-medium text-foreground">Status do ticket:</span>{" "}
                                                {getTicketStatusLabel(treatment.ticketStatus)}
                                            </div>
                                            <div>
                                                <span className="font-medium text-foreground">Status do atendimento:</span>{" "}
                                                {getStatusText(treatment.status)}
                                            </div>
                                            <div>
                                                <span className="font-medium text-foreground">Ticket criado em:</span>{" "}
                                                {formatDate(treatment.ticketCreatedAt ?? null)}
                                            </div>
                                            <div>
                                                <span className="font-medium text-foreground">Chamado em:</span>{" "}
                                                {formatDate(treatment.ticketCalledAt ?? null)}
                                            </div>
                                            <div>
                                                <span className="font-medium text-foreground">Início do atendimento:</span>{" "}
                                                {formatDate(treatment.startedAt ?? null)}
                                            </div>
                                            <div>
                                                <span className="font-medium text-foreground">Finalizado em:</span>{" "}
                                                {formatDate(
                                                    treatment.ticketFinishedAt
                                                        ? treatment.ticketFinishedAt
                                                        : treatment.finishedAt ?? null
                                                )}
                                            </div>
                                            <div>
                                                <span className="font-medium text-foreground">Duração do atendimento:</span>{" "}
                                                {treatment.duration != null ? formatDuration(treatment.duration) : "Em andamento"}
                                            </div>
                                            <div>
                                                <span className="font-medium text-foreground">Tempo de espera:</span>{" "}
                                                {treatment.waitingTimeMinutes != null
                                                    ? `${treatment.waitingTimeMinutes} min`
                                                    : "-"}
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
                    {treatments.length > 20 && (
                        <div className="flex justify-center pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAll(!showAll)}
                            >
                                {showAll ? "Ver menos" : `Ver mais (${treatments.length - 20} restantes)`}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default TreatmentsList;
