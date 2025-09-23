"use client";

import { useEffect, useState } from "react";

import { PageContainer, PageContent, PageDescription, PageHeader, PageHeaderContent, PageTitle } from "@/components/ui/page-container";
import { usersTable } from "@/db/schema";

import OperationsList from "./_components/operations-list";
import PausesList from "./_components/pauses-list";
import ProfessionalHeader from "./_components/professional-header";
import ProfessionalMetrics from "./_components/professional-metrics";
import ProfessionalSelector from "./_components/professional-selector";
import TreatmentsList from "./_components/treatments-list";

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
    operations: Array<{
        id: string;
        status: string;
        createdAT: Date | string;
        updatedAt: Date | string;
        treatments: Array<{
            id: string;
            duration: number | null;
            status: string;
            createdAT: Date | string;
            updatedAt: Date | string;
        }>;
        pauses: Array<{
            id: string;
            duration: number | null;
            reason: string;
            status: string;
            createdAT: Date | string;
            updatedAt: Date | string;
        }>;
    }>;
    treatments: Array<{
        id: string;
        duration: number | null;
        status: string;
        createdAT: Date | string;
        updatedAt: Date | string;
    }>;
}

const AdminsProfessionals = () => {
    const [professionals, setProfessionals] = useState<(typeof usersTable.$inferSelect)[]>([]);
    const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("");
    const [selectedProfessional, setSelectedProfessional] = useState<(typeof usersTable.$inferSelect) | null>(null);
    const [metrics, setMetrics] = useState<ProfessionalMetricsData>({
        totalOperations: 0,
        averageOperationTime: 0,
        totalPauses: 0,
        averagePauseTime: 0,
        averagePauseTimeByReason: [],
        totalTreatments: 0,
        averageTreatmentTime: 0,
        operations: [],
        treatments: [],
    });
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    // Carregar profissionais
    useEffect(() => {
        const loadProfessionals = async () => {
            try {
                const response = await fetch('/api/professionals');
                if (response.ok) {
                    const professionalsData = await response.json();
                    setProfessionals(professionalsData);
                }
            } catch (error) {
                console.error("Erro ao carregar profissionais:", error);
            }
        };

        loadProfessionals();
    }, []);

    // Carregar métricas quando profissional ou data mudar
    useEffect(() => {
        if (!selectedProfessionalId) return;

        const loadMetrics = async () => {
            setLoading(true);
            try {
                const url = selectedDate
                    ? `/api/professionals/${selectedProfessionalId}/metrics?date=${selectedDate.toISOString()}`
                    : `/api/professionals/${selectedProfessionalId}/metrics`;

                const response = await fetch(url);
                if (response.ok) {
                    const metricsData = await response.json();
                    setMetrics(metricsData);
                }
            } catch (error) {
                console.error("Erro ao carregar métricas:", error);
            } finally {
                setLoading(false);
            }
        };

        loadMetrics();
    }, [selectedProfessionalId, selectedDate]);

    // Atualizar profissional selecionado
    useEffect(() => {
        if (selectedProfessionalId) {
            const professional = professionals.find(p => p.id === selectedProfessionalId);
            setSelectedProfessional(professional || null);
        } else {
            setSelectedProfessional(null);
        }
    }, [selectedProfessionalId, professionals]);

    const handleProfessionalSelect = (professionalId: string) => {
        setSelectedProfessionalId(professionalId);
        setSelectedDate(undefined); // Reset date when changing professional
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
    };

    const handleUpdateSuccess = () => {
        // Recarregar profissionais após atualização
        const loadProfessionals = async () => {
            try {
                const response = await fetch('/api/professionals');
                if (response.ok) {
                    const professionalsData = await response.json();
                    setProfessionals(professionalsData);
                }
            } catch (error) {
                console.error("Erro ao recarregar profissionais:", error);
            }
        };
        loadProfessionals();
    };

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Profissionais</PageTitle>
                    <PageDescription>Visualize e gerencie os dados dos profissionais da sua empresa.</PageDescription>
                </PageHeaderContent>
            </PageHeader>
            <PageContent className="space-y-6">
                {/* Seletor de Profissional */}
                <ProfessionalSelector
                    professionals={professionals}
                    selectedProfessionalId={selectedProfessionalId}
                    onProfessionalSelect={handleProfessionalSelect}
                />

                {/* Cabeçalho do Profissional */}
                {selectedProfessional && (
                    <ProfessionalHeader
                        professional={selectedProfessional}
                        onUpdateSuccess={handleUpdateSuccess}
                    />
                )}

                {/* Métricas do Profissional */}
                {selectedProfessional && (
                    <ProfessionalMetrics
                        metrics={metrics}
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        professionalId={selectedProfessional.id}
                        professionalName={selectedProfessional.name}
                    />
                )}

                {/* Listas de Operações e Atendimentos */}
                {selectedProfessional && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <OperationsList operations={metrics.operations} />
                        <TreatmentsList treatments={metrics.treatments} />
                        <PausesList pauses={metrics.operations.flatMap(operation => operation.pauses)} />
                    </div>
                )}

                {/* Estado de carregamento */}
                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-muted-foreground">Carregando métricas...</div>
                    </div>
                )}
            </PageContent>
        </PageContainer>
    );
}

export default AdminsProfessionals;