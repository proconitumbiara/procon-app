"use client";

import { ChevronDown, ChevronRight, Clock, Pause } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatDateInSaoPaulo } from "@/lib/timezone-utils";

interface PauseItem {
    id: string;
    duration: number | null;
    status: string;
    reason: string;
    createdAT: Date | string;
    updatedAt: Date | string;
}

interface PausesListProps {
    pauses: PauseItem[];
}

const PausesList = ({ pauses }: PausesListProps) => {
    const [expandedPauses, setExpandedPauses] = useState<Set<string>>(new Set());
    const [showAllPauses, setShowAllPauses] = useState(false);

    const toggleExpanded = (pauseId: string) => {
        const newExpanded = new Set(expandedPauses);
        if (newExpanded.has(pauseId)) {
            newExpanded.delete(pauseId);
        } else {
            newExpanded.add(pauseId);
        }
        setExpandedPauses(newExpanded);
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
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'in-progress':
                return 'bg-yellow-100 text-yellow-800';
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
            case 'in-progress':
                return 'Em andamento';
            case 'finished':
                return 'Finalizada';
            case 'cancelled':
                return 'Cancelada';
            default:
                return status;
        }
    };

    const getReasonText = (reason: string) => {
        switch (reason.toLowerCase()) {
            case 'lunch':
                return 'Almoço';
            case 'break':
                return 'Intervalo';
            case 'meeting':
                return 'Reunião';
            case 'personal':
                return 'Pessoal';
            case 'technical':
                return 'Técnico';
            case 'finished-service':
                return 'Atendimento Finalizado';
            case 'other':
                return 'Outro';
            default:
                return reason.charAt(0).toUpperCase() + reason.slice(1);
        }
    };

    if (pauses.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Pause className="h-5 w-5" />
                        Pausas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">
                        Nenhuma pausa encontrada para este período.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Pause className="h-5 w-5" />
                    Pausas ({pauses.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {pauses
                    .sort((a, b) => {
                        const dateA = a.createdAT instanceof Date ? a.createdAT : new Date(a.createdAT);
                        const dateB = b.createdAT instanceof Date ? b.createdAT : new Date(b.createdAT);
                        return dateB.getTime() - dateA.getTime(); // Mais novo primeiro
                    })
                    .slice(0, showAllPauses ? undefined : 20)
                    .map((pause) => {
                        const isExpanded = expandedPauses.has(pause.id);

                        return (
                            <Collapsible
                                key={pause.id}
                                open={isExpanded}
                                onOpenChange={() => toggleExpanded(pause.id)}
                            >
                                <CollapsibleTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-between p-4 h-auto"
                                    >
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                            <div className="text-left">
                                                <div className="font-medium">
                                                    Pausa #{pause.id.slice(-8)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatDate(pause.createdAT)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pause.status)}`}>
                                                {getStatusText(pause.status)}
                                            </span>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                {pause.duration != null ? formatTime(pause.duration) : 'Em andamento'}
                                            </div>
                                        </div>
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="px-4 pb-4">
                                    <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                                        <div className="grid grid-cols-1 gap-3 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Motivo:</span>
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    {getReasonText(pause.reason)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Status:</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pause.status)}`}>
                                                    {getStatusText(pause.status)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Duração:</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {pause.duration ? formatTime(pause.duration) : 'Em andamento'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Iniciada em:</span>
                                                <span>{formatDate(pause.createdAT)}</span>
                                            </div>

                                            {pause.updatedAt && (
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">Atualizada em:</span>
                                                    <span>{formatDate(pause.updatedAt)}</span>
                                                </div>
                                            )}

                                            {pause.duration && (
                                                <div className="pt-2 border-t">
                                                    <div className="text-xs text-muted-foreground">
                                                        Esta pausa durou {formatTime(pause.duration)}.
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
                {pauses.length > 20 && (
                    <div className="pt-4 flex justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setShowAllPauses(!showAllPauses)}
                        >
                            {showAllPauses ? "Ver menos" : `Ver mais (${pauses.length - 20} restantes)`}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PausesList;
