"use client";

import { ChevronDown, ChevronRight, Clock, FileText, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import TreatmentResolutionDialog from "./treatment-resolution-dialog";

interface Treatment {
    id: string;
    duration: number | null;
    status: string;
    createdAT: Date | string;
    updatedAt: Date | string;
}

interface TreatmentsListProps {
    treatments: Treatment[];
}

const TreatmentsList = ({ treatments }: TreatmentsListProps) => {
    const [expandedTreatments, setExpandedTreatments] = useState<Set<string>>(new Set());

    const toggleExpanded = (treatmentId: string) => {
        const newExpanded = new Set(expandedTreatments);
        if (newExpanded.has(treatmentId)) {
            newExpanded.delete(treatmentId);
        } else {
            newExpanded.add(treatmentId);
        }
        setExpandedTreatments(newExpanded);
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
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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

    if (treatments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Atendimentos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">
                        Nenhum atendimento encontrado para este período.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Atendimentos ({treatments.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {treatments
                    .sort((a, b) => {
                        const dateA = a.createdAT instanceof Date ? a.createdAT : new Date(a.createdAT);
                        const dateB = b.createdAT instanceof Date ? b.createdAT : new Date(b.createdAT);
                        return dateB.getTime() - dateA.getTime(); // Mais novo primeiro
                    })
                    .map((treatment) => {
                        const isExpanded = expandedTreatments.has(treatment.id);

                        return (
                            <Collapsible
                                key={treatment.id}
                                open={isExpanded}
                                onOpenChange={() => toggleExpanded(treatment.id)}
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
                                                    Atendimento #{treatment.id.slice(-8)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatDate(treatment.createdAT)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(treatment.status)}`}>
                                                {getStatusText(treatment.status)}
                                            </span>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                {treatment.duration != null ? formatTime(treatment.duration) : 'Em andamento'}
                                            </div>
                                        </div>
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="px-4 pb-4">
                                    <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                                        <div className="grid grid-cols-1 gap-3 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Status:</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(treatment.status)}`}>
                                                    {getStatusText(treatment.status)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Duração:</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {treatment.duration != null ? formatTime(treatment.duration) : 'Em andamento'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Iniciado em:</span>
                                                <span>{formatDate(treatment.createdAT)}</span>
                                            </div>

                                            {treatment.updatedAt && (
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">Atualizado em:</span>
                                                    <span>{formatDate(treatment.updatedAt)}</span>
                                                </div>
                                            )}

                                            {treatment.duration != null && (
                                                <div className="pt-2 border-t">
                                                    <div className="text-xs text-muted-foreground">
                                                        Este atendimento foi concluído em {formatTime(treatment.duration)}.
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-4 border-t">
                                                <TreatmentResolutionDialog treatmentId={treatment.id}>
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        Visualizar Resolução
                                                    </Button>
                                                </TreatmentResolutionDialog>
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
            </CardContent>
        </Card>
    );
};

export default TreatmentsList;
