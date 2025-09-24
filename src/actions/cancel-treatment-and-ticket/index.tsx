"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { pausesTable, ticketsTable, treatmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { CancelTreatmentAndTicketSchema } from "./schema";
import { ErrorMessages, ErrorTypes } from "./schema";

export const cancelTreatmentAndTicket = actionClient
    .schema(CancelTreatmentAndTicketSchema)
    .action(async ({ parsedInput }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) {
            return {
                error: {
                    type: ErrorTypes.UNAUTHENTICATED,
                    message: ErrorMessages[ErrorTypes.UNAUTHENTICATED],
                },
            };
        }

        // Buscar atendimento
        const treatment = await db.query.treatmentsTable.findFirst({
            where: eq(treatmentsTable.id, parsedInput.treatmentId),
        });
        if (!treatment) {
            return {
                error: {
                    type: ErrorTypes.TREATMENT_NOT_FOUND,
                    message: ErrorMessages[ErrorTypes.TREATMENT_NOT_FOUND],
                },
            };
        }

        // Verificar se o atendimento está em andamento
        if (treatment.status !== "in_service") {
            return {
                error: {
                    type: ErrorTypes.TREATMENT_NOT_IN_SERVICE,
                    message: ErrorMessages[ErrorTypes.TREATMENT_NOT_IN_SERVICE],
                },
            };
        }

        // Buscar ticket
        const ticket = await db.query.ticketsTable.findFirst({
            where: eq(ticketsTable.id, parsedInput.ticketId),
        });
        if (!ticket) {
            return {
                error: {
                    type: ErrorTypes.TICKET_NOT_FOUND,
                    message: ErrorMessages[ErrorTypes.TICKET_NOT_FOUND],
                },
            };
        }

        // Calcular duração do atendimento
        const start =
            treatment.createdAT instanceof Date
                ? treatment.createdAT
                : new Date(treatment.createdAT);
        const end = new Date();
        const durationMs = end.getTime() - start.getTime();
        const durationMinutes = Math.floor(durationMs / 60000); // duração em minutos

        // Atualizar status do ticket para "cancelled"
        await db
            .update(ticketsTable)
            .set({ status: "cancelled" })
            .where(eq(ticketsTable.id, parsedInput.ticketId));

        // Atualizar status do atendimento para "cancelled" (sem processNumber)
        await db
            .update(treatmentsTable)
            .set({ status: "cancelled", duration: durationMinutes })
            .where(eq(treatmentsTable.id, treatment.id));

        // Criar pausa
        await db.insert(pausesTable).values({
            operationId: treatment.operationId,
            reason: "cancelled-service",
        });

        revalidatePath("/users/professionals-services");
    });
