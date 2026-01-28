"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, EqualApproximately, FileText, MonitorCheck, Pause, PhoneCall } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";

import { generateProfessionalMetricsPDF } from "@/actions/professionals/generate-professional-metrics-pdf";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getEndOfDayInSaoPauloUTC, getStartOfDayInSaoPauloUTC } from "@/lib/timezone-utils";
import { cn } from "@/lib/utils";

interface ProfessionalMetricsData {
    totalOperations: number;
    averageOperationTime: number;
    totalPauses: number;
    averagePauseTime: number;
    averagePauseTimeByReason: Array<{
        reason: string;
        count: number;
        averageTime: number;
    }>;
    totalTreatments: number;
    averageTreatmentTime: number;
}

interface ProfessionalMetricsProps {
    metrics: ProfessionalMetricsData;
    selectedDateRange?: DateRange;
    onDateRangeSelect: (range: DateRange | undefined) => void;
    professionalId: string;
    professionalName: string;
}

const ProfessionalMetrics = ({ metrics, selectedDateRange, onDateRangeSelect, professionalId, professionalName }: ProfessionalMetricsProps) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

    const formatDateRange = (range: DateRange | undefined): string => {
        if (!range?.from) {
            return "Selecionar período";
        }
        const dateOnly = (d: Date) => format(d, "dd/MM/yyyy", { locale: ptBR });
        if (range.from && range.to) {
            return `${dateOnly(range.from)} - ${dateOnly(range.to)}`;
        }
        return dateOnly(range.from);
    };

    const handleGeneratePDF = async () => {
        setIsGeneratingPDF(true);
        try {
            // Criar intervalo de data correto convertendo para UTC
            let fromDate: Date | undefined = undefined;
            let toDate: Date | undefined = undefined;

            if (selectedDateRange?.from) {
                // Converter início do período para UTC (considerando horário de São Paulo)
                fromDate = getStartOfDayInSaoPauloUTC(selectedDateRange.from);

                if (selectedDateRange.to) {
                    // Converter fim do período para UTC
                    toDate = getEndOfDayInSaoPauloUTC(selectedDateRange.to);
                } else {
                    // Se só tem data inicial, usar fim do mesmo dia
                    toDate = getEndOfDayInSaoPauloUTC(selectedDateRange.from);
                }
            }

            const result = await generateProfessionalMetricsPDF({
                professionalId,
                professionalName,
                from: fromDate,
                to: toDate,
            });

            if (result?.data?.success && result.data.pdfData) {
                // Criar blob a partir do base64 e fazer download
                const byteCharacters = atob(result.data.pdfData);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });

                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = result.data.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                console.error('Erro ao gerar PDF:', result?.serverError);
            }
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
        } finally {
            setIsGeneratingPDF(false);
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

    return (
        <div className="space-y-6">
            {/* Seletor de Período */}
            <div className="flex justify-between items-center gap-4">
                <h3 className="text-lg font-semibold">Métricas do Profissional</h3>
                <div className="flex justify-between items-center gap-2">
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-[350px] justify-start text-left font-normal",
                                    !selectedDateRange?.from && "text-muted-foreground"
                                )}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                {formatDateRange(selectedDateRange)}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                                mode="range"
                                selected={selectedDateRange}
                                onSelect={(range) => {
                                    onDateRangeSelect(range);
                                    // Fechar apenas quando ambas as datas estiverem selecionadas
                                    if (range?.from && range?.to) {
                                        setIsCalendarOpen(false);
                                    }
                                }}
                                initialFocus
                                locale={ptBR}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                    {selectedDateRange?.from && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDateRangeSelect(undefined)}
                        >
                            Ver todos os dados
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGeneratePDF}
                        disabled={isGeneratingPDF}
                        className="ml-auto"
                    >
                        {isGeneratingPDF ? "Gerando Relatório..." : "Gerar Relatório"}
                    </Button>
                </div>
            </div>

            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Operações */}
                <Card>
                    <CardHeader className="flex flex-row items-center space-y-0 gap-2 pb-2">
                        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                            <MonitorCheck className="text-primary h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-medium">Operações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalOperations}</div>
                        <p className="text-xs text-muted-foreground">
                            Tempo médio: {formatTime(metrics.averageOperationTime)}
                        </p>
                    </CardContent>
                </Card>

                {/* Pausas */}
                <Card>
                    <CardHeader className="flex flex-row items-center space-y-0 gap-2 pb-2">
                        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                            <Pause className="text-primary h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-medium">Pausas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalPauses}</div>
                        <p className="text-xs text-muted-foreground">
                            Tempo médio: {formatTime(metrics.averagePauseTime)}
                        </p>
                    </CardContent>
                </Card>

                {/* Atendimentos */}
                <Card>
                    <CardHeader className="flex flex-row items-center space-y-0 gap-2 pb-2">
                        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                            <PhoneCall className="text-primary h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-medium"> Atendimentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalTreatments}</div>
                        <p className="text-xs text-muted-foreground">
                            Tempo médio: {formatTime(metrics.averageTreatmentTime)}
                        </p>
                    </CardContent>
                </Card>

                {/* Média de Atendimentos por Operação */}
                <Card>
                    <CardHeader className="flex flex-row items-center space-y-0 gap-2 pb-2">
                        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                            <EqualApproximately className="text-primary h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-medium">Média por Operação</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ~{metrics.totalOperations > 0
                                ? (metrics.totalTreatments / metrics.totalOperations).toFixed(1)
                                : '0.0'
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Atendimentos por operação
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detalhes das Pausas por Motivo */}
            {metrics.averagePauseTimeByReason.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pausas por Motivo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {metrics.averagePauseTimeByReason.map((pause, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                    <span className="font-medium capitalize">{getReasonText(pause.reason)}</span>
                                    <div className="text-sm text-muted-foreground">
                                        {pause.count} pausas • {formatTime(pause.averageTime)} médio
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ProfessionalMetrics;
