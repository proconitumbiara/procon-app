import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { db } from "@/db";
import { clientsTable, ticketsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  buildUserPermissions,
} from "@/lib/authorization";

import ClientDetailView from "./_components/client-detail-view";

interface ConsumerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConsumerDetailPage({
  params,
}: ConsumerDetailPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const perms = buildUserPermissions({
    id: session.user.id,
    role: session.user.role,
    profile: (session.user as any).profile,
  });

  if (!perms.can("clients.view")) {
    redirect("/atendimento");
  }

  const { id } = await params;

  const [client] = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.id, id))
    .limit(1);

  if (!client) {
    notFound();
  }

  const ticketsRaw = await db.query.ticketsTable.findMany({
    where: eq(ticketsTable.clientId, id),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    with: {
      sector: true,
      treatment: {
        with: {
          operation: {
            with: {
              servicePoint: {
                with: {
                  sector: true,
                },
              },
              user: true,
            },
          },
        },
      },
    },
  });

  const tickets = ticketsRaw.map((ticket) => ({
    id: ticket.id,
    status: ticket.status,
    priority: ticket.priority ?? 0,
    sectorName: ticket.sector?.name ?? "-",
    sectorId: ticket.sectorId,
    createdAt: new Date(ticket.createdAt),
    calledAt: ticket.calledAt ? new Date(ticket.calledAt) : null,
    finishedAt: ticket.finishedAt ? new Date(ticket.finishedAt) : null,
    servicePointName:
      ticket.treatment?.operation?.servicePoint?.name ?? null,
    professionalName: ticket.treatment?.operation?.user?.name ?? null,
    treatmentDuration: ticket.treatment?.duration ?? null,
    treatmentStatus: ticket.treatment?.status ?? null,
  }));

  return (
    <ClientDetailView
      client={{
        id: client.id,
        name: client.name,
        register: client.register,
        dateOfBirth: client.dateOfBirth,
        phoneNumber: client.phoneNumber,
      }}
      tickets={tickets}
    />
  );
}

