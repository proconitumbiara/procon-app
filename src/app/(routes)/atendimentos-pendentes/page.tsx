import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { ticketsTable } from "@/db/schema";

import TicketsFilters from "./_components/tickets-filters";

const PendingAppointments = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  // Apenas tickets pendentes, com client e sector (uma query; retorna só o necessário)
  const ticketsRaw = await db.query.ticketsTable.findMany({
    where: eq(ticketsTable.status, "pending"),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
    with: {
      client: true,
      sector: true,
    },
  });

  const tickets = ticketsRaw.map((ticket) => ({
    id: ticket.id,
    status: ticket.status,
    priority: ticket.priority ?? 0,
    clientName: ticket.client?.name ?? "-",
    clientId: ticket.clientId,
    sectorName: ticket.sector?.name ?? "-",
    sectorId: ticket.sectorId,
    createdAt: new Date(ticket.createdAt),
  }));

  // Setores (apenas para filtros na UI; lista pequena)
  const sectors = await db.query.sectorsTable.findMany();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Tickets</PageTitle>
          <PageDescription>
            Visualize e gerencie os tickets dos consumidores.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <></>
        </PageActions>
      </PageHeader>
      <PageContent>
        <TicketsFilters tickets={tickets} sectors={sectors} />
      </PageContent>
    </PageContainer>
  );
};

export default PendingAppointments;
