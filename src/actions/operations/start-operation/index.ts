"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { operationsTable, servicePointsTable } from "@/db/schema";
import { authActionClient } from "@/lib/next-safe-action";
import { assertSectorKeyAccess, buildUserPermissions } from "@/lib/authorization";
import { pusherServer } from "@/lib/pusher-server";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime";

import { ErrorMessages, ErrorTypes, schema } from "./schema";

export const startOperation = authActionClient
  .schema(schema)
  .action(async ({ parsedInput, ctx }) => {
    const { session } = ctx;

    const perms = buildUserPermissions({
      id: session.user.id,
      role: session.user.role,
      profile: (session.user as any).profile,
    });

    if (!perms.can("treatments.manage")) {
      return {
        error: {
          type: ErrorTypes.UNAUTHENTICATED,
          message: "Acesso negado",
        },
      };
    }

    const servicePoint = await db.query.servicePointsTable.findFirst({
      where: eq(servicePointsTable.id, parsedInput.servicePointId),
      with: { sector: true },
    });

    if (!servicePoint?.sector) {
      return {
        error: {
          type: ErrorTypes.UNAUTHENTICATED,
          message: "Ponto de serviço não encontrado",
        },
      };
    }

    try {
      assertSectorKeyAccess(perms, servicePoint.sector.key_name);
    } catch {
      return {
        error: {
          type: ErrorTypes.UNAUTHENTICATED,
          message: "Acesso negado para este setor",
        },
      };
    }

    const existingOperation = await db.query.operationsTable.findFirst({
      where: and(
        eq(operationsTable.userId, session.user.id),
        eq(operationsTable.status, "operating"),
      ),
    });

    if (existingOperation) {
      return {
        error: {
          type: ErrorTypes.OPERATION_ALREADY_ACTIVE,
          message: ErrorMessages[ErrorTypes.OPERATION_ALREADY_ACTIVE],
        },
      };
    }

    await db.insert(operationsTable).values({
      status: "operating",
      userId: session.user.id,
      servicePointId: parsedInput.servicePointId,
      createdAt: new Date(),
    });

    await db
      .update(servicePointsTable)
      .set({ availability: "operating", updatedAt: new Date() })
      .where(eq(servicePointsTable.id, parsedInput.servicePointId));

    revalidatePath("/atendimento");
    void pusherServer
      .trigger(REALTIME_CHANNELS.operations, REALTIME_EVENTS.operationStarted, {
        userId: session.user.id,
        servicePointId: parsedInput.servicePointId,
      })
      .catch(() => {});
    void pusherServer
      .trigger(REALTIME_CHANNELS.operations, REALTIME_EVENTS.autoCallCheck, {
        userId: session.user.id,
      })
      .catch(() => {});

    return { success: true };
  });
