import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import React from "react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { db } from "@/db";
import { servicePointsTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import FinishOperationButton from "./finish-operation-button";

interface OngoingOperationCardProps {
    operations: {
        id: string;
        status: string;
        userId: string;
        servicePointId: string;
    }[];
}

const OngoingOperationCard = async ({ operations }: OngoingOperationCardProps) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const userId = session?.user?.id;

    // Filtra a operação do usuário logado com status 'operating'
    const operatingOperation = operations.find(op => op.status === "operating" && op.userId === userId);

    let userName = "";
    let servicePointName = "";

    if (operatingOperation) {
        const [user, servicePoint] = await Promise.all([
            db.query.usersTable.findFirst({ where: eq(usersTable.id, operatingOperation.userId) }),
            db.query.servicePointsTable.findFirst({ where: eq(servicePointsTable.id, operatingOperation.servicePointId) })
        ]);
        userName = user?.name || operatingOperation.userId;
        servicePointName = servicePoint?.name || operatingOperation.servicePointId;
    }

    return (
        <Card className="relative w-full h-full flex flex-col">
            {/* Bola verde no canto superior direito */}
            {operatingOperation && (
                <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-green-500 border-1 border-white shadow" title="Online"></span>
            )}
            <CardContent className="flex-1 overflow-auto p-0">
                {operatingOperation ? (
                    <div className="flex flex-col items-center justify-center gap-4">
                        <h1 className="font-semibold text-primary">Dados da operação atual</h1>
                        <div className="flex flex-row gap-2">
                            <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Status:</span> {operatingOperation.status === "operating" ? "Operando" : operatingOperation.status}</p>
                            <div className="h-4 border-l-1 border-gray-300" />
                            <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Usuário:</span> {userName}</p>
                            <div className="h-4 border-l-1 border-gray-300" />
                            <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Ponto de Serviço:</span> {servicePointName}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">Nenhuma operação em andamento.</p>
                    </div>
                )}
            </CardContent>
            {operatingOperation && (
                <CardFooter className="flex flex-row items-center justify-center gap-4 w-full">
                    <FinishOperationButton operationId={operatingOperation.id} />
                </CardFooter>
            )}
        </Card>
    );
}

export default OngoingOperationCard;