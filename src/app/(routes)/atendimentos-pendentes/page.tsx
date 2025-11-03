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

import TicketsFilters from "./_components/tickets-filters";

const PendingAppointments = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  // Buscar tickets, clientes e setores separadamente
  const [ticketsRaw, clients, sectors] = await Promise.all([
    db.query.ticketsTable.findMany(),
    db.query.clientsTable.findMany(),
    db.query.sectorsTable.findMany(),
  ]);

  // Mapas para lookup rápido
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));
  const sectorMap = Object.fromEntries(sectors.map((s) => [s.id, s.name]));

  // Mapear para o formato da tabela
  const tickets = ticketsRaw.map((ticket) => ({
    id: ticket.id,
    status: ticket.status,
    clientName: clientMap[ticket.clientId] || "-",
    clientId: ticket.clientId,
    sectorName: sectorMap[ticket.sectorId] || "-",
    sectorId: ticket.sectorId,
    createdAt: new Date(ticket.createdAT),
  }));

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
