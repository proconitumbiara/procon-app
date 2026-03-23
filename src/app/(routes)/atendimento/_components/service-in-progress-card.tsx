import { and, eq } from "drizzle-orm";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { db } from "@/db";
import { treatmentsTable } from "@/db/schema";
import { formatDateInSaoPaulo } from "@/lib/timezone-utils";

import CallCustomerAgainButton from "./call-customer-again-button";
import FinishServiceButton from "./finish-service-button";

const saoPauloTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
});

interface ServiceInProgressCardProps {
    /** Id da operação em andamento do usuário (vinda da página). Quando null, o card não busca treatment. */
    operatingOperationId: string | null;
}

const ServiceInProgressCard = async ({ operatingOperationId }: ServiceInProgressCardProps) => {
    if (!operatingOperationId) {
        return (
            <Card className="w-full h-full text-sm text-muted-foreground text-center hidden">Nenhuma operação em andamento.</Card>
        );
    }

    // Uma única query: treatment em serviço para a operação, com ticket e client
    const treatmentWithTicketAndClient = await db.query.treatmentsTable.findFirst({
        where: and(
            eq(treatmentsTable.operationId, operatingOperationId),
            eq(treatmentsTable.status, "in_service"),
        ),
        with: {
            ticket: {
                with: {
                    client: true,
                },
            },
        },
    });

    const treatment = treatmentWithTicketAndClient;
    const ticket = treatment?.ticket ?? null;
    const client = ticket?.client ?? null;

    if (!treatment) {
        return (
            <Card className="w-full h-full text-sm text-muted-foreground text-center">Nenhum atendimento em andamento.</Card>
        );
    }

    // Formatar data e horário de início
    const startDate = treatment.createdAt ? new Date(treatment.createdAt) : null;
    const formattedDate = startDate ? formatDateInSaoPaulo(startDate) : "-";
    const formattedTime = startDate ? saoPauloTimeFormatter.format(startDate) : "-";

    return (
        <div className="flex flex-col gap-4 w-full h-full max-h-[80vh]">
            <Card className="w-full h-full flex flex-col">
                <CardContent className="flex-1 overflow-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <h1 className="font-semibold text-primary">Dados do atendimento em andamento</h1>
                        <div className="flex flex-row gap-2">
                            <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Consumidor:</span> {client?.name || "-"}</p>
                            <div className="h-4 border border-gray-300" />
                            <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Data:</span> {formattedDate}</p>
                            {/* <div className="h-4 border border-gray-300" />
                            <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Horário de início:</span> {formattedTime}</p> */}
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