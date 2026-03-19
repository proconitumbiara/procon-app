import { and, eq, lt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { ticketsTable, treatmentsTable } from "@/db/schema";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { pusherServer } from "@/lib/pusher-server";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const staleTreatments = await db.query.treatmentsTable.findMany({
    where: and(
      eq(treatmentsTable.status, "in_service"),
      lt(treatmentsTable.createdAt, twoHoursAgo),
    ),
  });

  if (staleTreatments.length === 0) {
    return NextResponse.json({ closed: 0 });
  }

  const now = new Date();

  await db.transaction(async (tx) => {
    for (const treatment of staleTreatments) {
      const start =
        treatment.createdAt instanceof Date
          ? treatment.createdAt
          : new Date(treatment.createdAt);
      const durationMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);

      await tx
        .update(treatmentsTable)
        .set({ status: "finished", duration: durationMinutes })
        .where(eq(treatmentsTable.id, treatment.id));

      if (treatment.ticketId) {
        await tx
          .update(ticketsTable)
          .set({ status: "finished" })
          .where(eq(ticketsTable.id, treatment.ticketId));
      }
    }
  });

  void pusherServer
    .trigger(REALTIME_CHANNELS.tickets, REALTIME_EVENTS.ticketsChanged, {
      source: "cron-close-stale-treatments",
      count: staleTreatments.length,
    })
    .catch((error) => {
      logger.warn("close-stale-treatments emit failed", { error });
    });
  void pusherServer
    .trigger(REALTIME_CHANNELS.operations, REALTIME_EVENTS.autoCallCheck, {
      source: "cron-close-stale-treatments",
    })
    .catch(() => {});

  return NextResponse.json({ closed: staleTreatments.length });
}
