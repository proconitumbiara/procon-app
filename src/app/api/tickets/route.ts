import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { ticketsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickets = await db.query.ticketsTable.findMany({
    where: eq(ticketsTable.status, "pending"),
  });

  return NextResponse.json({ tickets });
}
