import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { db } from "@/db";
import { clientsTable, operationsTable, ticketsTable, treatmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import CallCustomerAgainButton from "./call-customer-again-button";
import FinishServiceButton from "./finish-service-button";

const ServiceInProgressCard = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return (
            <div className="flex flex-col gap-4 w-full h-full max-h-[80vh] items-center justify-center">
                <p className="text-sm text-muted-foreground">Usuário não autenticado.</p>
            </div>
        );
    }

    // Buscar operação em andamento do usuário logado
    const operation = await db.query.operationsTable.findFirst({
        where: and(
            eq(operationsTable.userId, session.user.id),
            eq(operationsTable.status, "operating")
        ),
    });

    if (!operation) {
        return (
            <Card className="w-full h-full text-sm text-muted-foreground text-center hidden">Nenhuma operação em andamento.</Card>
        );
    }

    // Buscar atendimento (treatment) em andamento para a operação
    const treatment = await db.query.treatmentsTable.findFirst({
        where: and(
            eq(treatmentsTable.operationId, operation.id),
            eq(treatmentsTable.status, "in_service")
        ),
    });

    if (!treatment) {
        return (
            <Card className="w-full h-full text-sm text-muted-foreground text-center">Nenhum atendimento em andamento.</Card>
        );
    }

    // Buscar ticket e cliente associados ao atendimento
    const ticket = await db.query.ticketsTable.findFirst({
        where: eq(ticketsTable.id, treatment.ticketId),
    });
    let client = null;
    if (ticket) {
        client = await db.query.clientsTable.findFirst({
            where: eq(clientsTable.id, ticket.clientId),
        });
    }

    // Formatar data e horário de início
    const startDate = treatment.createdAT ? new Date(treatment.createdAT) : null;
    const formattedDate = startDate ? startDate.toLocaleDateString() : "-";
    const formattedTime = startDate ? startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";

    return (
        <div className="flex flex-col gap-4 w-full h-full max-h-[80vh]">
            <Card className="w-full h-full flex flex-col">
                <CardContent className="flex-1 overflow-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <h1 className="font-semibold text-primary">Dados do atendimento em andamento</h1>
                        <div className="flex flex-row gap-2">
                            <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Consumidor:</span> {client?.name || "-"}</p>
                            <div className="h-4 border-l-1 border-gray-300" />
                            <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Data:</span> {formattedDate}</p>
                            <div className="h-4 border-l-1 border-gray-300" />
                            <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Horário de início:</span> {formattedTime}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-row items-center justify-center gap-4 w-full">
                    {ticket && treatment && (
                        <CallCustomerAgainButton ticket={{ id: ticket.id }} treatment={{ id: treatment.id }} />
                    )}
                    <FinishServiceButton treatmentId={treatment.id} />
                </CardFooter>
            </Card>
        </div>
    );
};

export default ServiceInProgressCard;