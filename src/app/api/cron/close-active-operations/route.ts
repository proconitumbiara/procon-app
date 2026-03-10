import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { operationsTable, servicePointsTable } from "@/db/schema";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activeOperations = await db.query.operationsTable.findMany({
    where: eq(operationsTable.status, "operating"),
  });

  if (activeOperations.length === 0) {
    return NextResponse.json({ closed: 0 });
  }

  for (const operation of activeOperations) {
    await db
      .update(operationsTable)
      .set({ status: "finished", updatedAt: new Date() })
      .where(eq(operationsTable.id, operation.id));

    await db
      .update(servicePointsTable)
      .set({ availability: "free" })
      .where(eq(servicePointsTable.id, operation.servicePointId));
  }

  return NextResponse.json({ closed: activeOperations.length });
}
