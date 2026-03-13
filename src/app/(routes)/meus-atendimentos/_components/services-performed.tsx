import { eq } from "drizzle-orm";

import { db } from "@/db";
import { treatmentsTable } from "@/db/schema";

import {
  ServicePerformedTableRow,
} from "./services-performed-columns";
import ServicesPerformedList from "../../meus-atendimentos/_components/services-performed-list";

function isToday(date: Date): boolean {
  const d = new Date(date);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

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

  // Filtrar apenas treatments do usuário e do dia atual (pela data de finalização do ticket)
  const filtered = treatments.filter((t) => {
    if (!t.operation || t.operation.userId !== userId) return false;
    const finishedAt = t.ticket?.finishedAt;
    if (!finishedAt) return false;
    return isToday(new Date(finishedAt));
  });

  // Mapear para ServicePerformedTableRow (createdAt/calledAt/finishedAt do ticket)
  const tableData: ServicePerformedTableRow[] = filtered
    .map((treatment) => {
      const ticket = treatment.ticket;
      return {
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
        createdAt: ticket?.createdAt ? new Date(ticket.createdAt) : new Date(treatment.createdAt),
        calledAt: ticket?.calledAt ? new Date(ticket.calledAt) : null,
        finishedAt: ticket?.finishedAt ? new Date(ticket.finishedAt) : null,
        clientName: treatment.ticket?.client?.name || "-",
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <ServicesPerformedList tableData={tableData} />
  );
};

export default ServicesPerformed;
