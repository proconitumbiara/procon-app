import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { operationsTable, servicePointsTable } from "@/db/schema";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { pusherServer } from "@/lib/pusher-server";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activeOperations = await db.query.operationsTable.findMany({
    where: inArray(operationsTable.status, ["operating", "in-attendance"]),
  });

  if (activeOperations.length === 0) {
    return NextResponse.json({ closed: 0 });
  }

  await db.transaction(async (tx) => {
    for (const operation of activeOperations) {
      await tx
        .update(operationsTable)
        .set({ status: "finished", updatedAt: new Date() })
        .where(eq(operationsTable.id, operation.id));

      await tx
        .update(servicePointsTable)
        .set({ availability: "free" })
        .where(eq(servicePointsTable.id, operation.servicePointId));
    }
  });

  void pusherServer
    .trigger(REALTIME_CHANNELS.operations, REALTIME_EVENTS.operationFinished, {
      operationIds: activeOperations.map((op) => op.id),
      source: "cron-close-active-operations",
    })
    .catch((error) => {
      logger.warn("close-active-operations emit failed", { error });
    });
  void pusherServer
    .trigger(REALTIME_CHANNELS.operations, REALTIME_EVENTS.autoCallCheck, {
      source: "cron-close-active-operations",
    })
    .catch(() => {});

  return NextResponse.json({ closed: activeOperations.length });
}
