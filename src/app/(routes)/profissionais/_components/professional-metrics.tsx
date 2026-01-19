"use client";

import { ptBR } from "date-fns/locale";
import { Calendar, EqualApproximately, FileText, MonitorCheck, Pause, PhoneCall } from "lucide-react";
import { useState } from "react";

import { generateProfessionalMetricsPDF } from "@/actions/professionals/generate-professional-metrics-pdf";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
    selectedDate?: Date;
    onDateSelect: (date: Date | undefined) => void;
    professionalId: string;
    professionalName: string;
}

const ProfessionalMetrics = ({ metrics, selectedDate, onDateSelect, professionalId, professionalName }: ProfessionalMetricsProps) => {
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

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleGeneratePDF = async () => {
        setIsGeneratingPDF(true);
        try {
            // Criar intervalo de data correto
            let fromDate: Date | undefined = undefined;
            let toDate: Date | undefined = undefined;

            if (selectedDate) {
                // Início do dia selecionado
                fromDate = new Date(selectedDate);
                fromDate.setHours(0, 0, 0, 0);

                // Fim do dia selecionado
                toDate = new Date(selectedDate);
                toDate.setHours(23, 59, 59, 999);
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
            {/* Seletor de Data */}
            <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">Métricas do Profissional</h3>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                            )}
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            {selectedDate ? formatDate(selectedDate) : "Selecionar data"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                                onDateSelect(date);
                                setIsCalendarOpen(false);
                            }}
                            initialFocus
                            locale={ptBR}
                        />
                    </PopoverContent>
                </Popover>
                {selectedDate && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDateSelect(undefined)}
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
                    <FileText className="mr-2 h-4 w-4" />
                    {isGeneratingPDF ? "Gerando PDF..." : "Gerar PDF"}
                </Button>
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
