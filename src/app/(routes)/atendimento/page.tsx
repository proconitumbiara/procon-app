import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageActions, PageContainer, PageContent, PageDescription, PageHeader, PageHeaderContent, PageTitle } from "@/components/ui/page-container";
import { db } from "@/db";
import { auth } from "@/lib/auth";

import OngoingOperationCard from "./_components/ongoing-operation-card";
import PendingTickets from "./_components/pending-tickets";
import ServiceInProgressCard from "./_components/service-in-progress-card";
import StartOperationButton from "./_components/start-operation-button";


const ProfessionalServices = async () => {
    const sessionPromise = auth.api.getSession({
        headers: await headers(),
    });
    const sectorsPromise = db.query.sectorsTable.findMany({
        with: {
            servicePoints: true,
        },
    });
    const operationsPromise = db.query.operationsTable.findMany();

    const [session, sectors, operations] = await Promise.all([
        sessionPromise,
        sectorsPromise,
        operationsPromise,
    ]);

    if (!session?.user) {
        redirect("/");
    }

    const operatingOperation = operations.find(
        (op) => op.status === "operating" && op.userId === session.user.id,
    );

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Olá, {session.user.name}!</PageTitle>
                    <PageDescription>Inicie uma operação de atendimento.</PageDescription>
                </PageHeaderContent>
                <PageActions>
                    <StartOperationButton sectors={sectors} disabled={!!operatingOperation} />
                </PageActions>
            </PageHeader>
            <PageContent>
                <div className="flex gap-2 w-full h-full">
                    <OngoingOperationCard operations={operations} />
                    <ServiceInProgressCard operatingOperationId={operatingOperation?.id ?? null} />
                </div>
                <div className="flex gap-2 w-full h-full items-center justify-center">
                    <PendingTickets />
                </div>
            </PageContent>
        </PageContainer>
    );
}

export default ProfessionalServices;