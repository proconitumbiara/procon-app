"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { consultationsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { CreateConsultationSchema, ErrorMessages, ErrorTypes, UpdateConsultationSchema } from "./schema";

export const updateConsultation = actionClient
    .schema(UpdateConsultationSchema)
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

        await db
            .update(consultationsTable)
            .set({
                consultationNumber: parsedInput.consultationNumber,
                authorizationArquive: parsedInput.authorizationArquive,
            })
            .where(eq(consultationsTable.id, parsedInput.id));

        revalidatePath("/users/professionals-services");
    });

export const createConsultation = actionClient
    .schema(CreateConsultationSchema)
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

        await db.insert(consultationsTable).values({
            consultationNumber: parsedInput.consultationNumber,
            authorizationArquive: parsedInput.authorizationArquive,
            treatmentId: parsedInput.treatmentId,
            ticketId: parsedInput.ticketId,
        });

        revalidatePath("/users/professionals-services");
    });
