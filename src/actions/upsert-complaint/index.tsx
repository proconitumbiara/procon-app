"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { complaintsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { CreateComplaintSchema, ErrorMessages, ErrorTypes, UpdateComplaintSchema } from "./schema";

export const updateComplaint = actionClient
    .schema(UpdateComplaintSchema)
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
            .update(complaintsTable)
            .set({
                caseNumber: parsedInput.caseNumber,
                consumerName: parsedInput.consumerName,
                supplierName: parsedInput.supplierName,
                numberOfPages: parsedInput.numberOfPages,
                status: parsedInput.status,
                authorizationArquive: parsedInput.authorizationArquive,
            })
            .where(eq(complaintsTable.id, parsedInput.id));

        revalidatePath("/users/professionals-services");
    });

export const createComplaint = actionClient
    .schema(CreateComplaintSchema)
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

        await db.insert(complaintsTable).values({
            caseNumber: parsedInput.caseNumber,
            consumerName: parsedInput.consumerName,
            supplierName: parsedInput.supplierName,
            numberOfPages: parsedInput.numberOfPages,
            status: parsedInput.status,
            authorizationArquive: parsedInput.authorizationArquive,
            treatmentId: parsedInput.treatmentId,
            ticketId: parsedInput.ticketId,
        });

        revalidatePath("/users/professionals-services");
    });
