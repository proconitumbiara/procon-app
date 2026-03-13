"use client";

import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import {
  PageContainer,
  PageContent,
} from "@/components/ui/page-container";
import { getEndOfDayInSaoPauloUTC, getStartOfDayInSaoPauloUTC } from "@/lib/timezone-utils";
import { usersTable } from "@/db/schema";

import DayHistory from "../../_components/day-history";
import OperationsList from "../../_components/operations-list";
import PausesList from "../../_components/pauses-list";
import ProfessionalHeader from "../../_components/professional-header";
import ProfessionalMetrics from "../../_components/professional-metrics";
import TreatmentsList from "../../_components/treatments-list";

interface ProfessionalMetricsData {
  totalOperations: number;
  averageOperationTime: number;
  totalTreatments: number;
  averageTreatmentTime: number;
  totalPauses: number;
  averagePausesPerOperation: number;
  averageTimeBetweenTreatments: number;
  operations: Array<{
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
  }>;
  treatments: Array<{
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
  }>;
  pauses: Array<{
    id: string;
    reason: string;
    duration: number;
    status: string;
    createdAt: Date | string;
    finishedAt: Date | string | null;
    operationId: string;
    operationCreatedAt: Date | string;
  }>;
}

interface ProfessionalDetailClientProps {
  professional: typeof usersTable.$inferSelect;
  professionalId: string;
  showActions: boolean;
}

const ProfessionalDetailClient = ({
  professional,
  professionalId,
  showActions,
}: ProfessionalDetailClientProps) => {
  const [metrics, setMetrics] = useState<ProfessionalMetricsData>({
    totalOperations: 0,
    averageOperationTime: 0,
    totalTreatments: 0,
    averageTreatmentTime: 0,
    totalPauses: 0,
    averagePausesPerOperation: 0,
    averageTimeBetweenTreatments: 0,
    operations: [],
    treatments: [],
    pauses: [],
  });
  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      try {
        let url = `/api/professionals/${professionalId}/metrics`;
        if (selectedDateRange?.from) {
          const fromUTC = getStartOfDayInSaoPauloUTC(selectedDateRange.from);
          const toUTC = selectedDateRange.to
            ? getEndOfDayInSaoPauloUTC(selectedDateRange.to)
            : getEndOfDayInSaoPauloUTC(selectedDateRange.from);
          url += `?from=${fromUTC.toISOString()}&to=${toUTC.toISOString()}`;
        }
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error("Erro ao carregar métricas:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, [professionalId, selectedDateRange]);

  return (
    <PageContainer>
      <PageContent className="space-y-6">
        <ProfessionalHeader
          professional={professional}
          showActions={showActions}
        />

        <ProfessionalMetrics
          metrics={metrics}
          selectedDateRange={selectedDateRange}
          onDateRangeSelect={setSelectedDateRange}
          professionalId={professionalId}
          professionalName={professional.name}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <OperationsList operations={metrics.operations} />
          <TreatmentsList treatments={metrics.treatments} />
          <DayHistory operations={metrics.operations} />
          <PausesList pauses={metrics.pauses} />
        </div>


        {loading && (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Carregando métricas...</p>
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default ProfessionalDetailClient;
