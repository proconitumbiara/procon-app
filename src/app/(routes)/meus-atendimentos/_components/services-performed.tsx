import { eq } from "drizzle-orm";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/db";
import { treatmentsTable } from "@/db/schema";

import {
  ServicePerformedTableRow,
  servicesPerformedColumns,
} from "./services-performed-columns";

interface ServicesPerformedProps {
  userId: string;
}

const ServicesPerformed = async ({ userId }: ServicesPerformedProps) => {
  // Buscar todos os treatments finalizados, incluindo relações necessárias
  const treatments = await db.query.treatmentsTable.findMany({
    where: eq(treatmentsTable.status, "finished"),
    with: {
      operation: {
        with: {
          servicePoint: {
            with: {
              sector: true,
            },
          },
        },
      },
      ticket: {
        with: {
          client: true,
        },
      },
    },
  });

  // Filtrar apenas treatments que possuem operation do usuário
  const filtered = treatments.filter(
    (t) => t.operation && t.operation.userId === userId,
  );

  if (!filtered.length) {
    return (
      <Card className="text-muted-foreground h-full w-full text-center text-sm">
        Nenhum atendimento realizado.
      </Card>
    );
  }

  // Mapear para ServicePerformedTableRow
  const tableData: ServicePerformedTableRow[] = filtered
    .map((treatment) => ({
      id: treatment.id,
      status: treatment.status,
      sectorName:
        treatment.operation?.servicePoint?.sector?.name ||
        treatment.operation?.servicePoint?.sectorId ||
        "-",
      sectorId: treatment.operation?.servicePoint?.sectorId || "-",
      servicePointName:
        treatment.operation?.servicePoint?.name ||
        treatment.operation?.servicePointId ||
        "-",
      servicePointId: treatment.operation?.servicePointId || "-",
      createdAt: treatment.createdAT,
      clientName: treatment.ticket?.client?.name || "-",
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="flex h-full max-h-[80vh] w-full flex-col gap-4">
      <Card className="flex h-full w-full flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Atendimentos Realizados</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          <div className="p-6">
            <DataTable data={tableData} columns={servicesPerformedColumns} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicesPerformed;
