import { NextResponse } from "next/server";

import { db } from "@/db";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await db.query.clientsTable.findMany();
  const sectors = await db.query.sectorsTable.findMany();

  return NextResponse.json({ clients, sectors });
} 