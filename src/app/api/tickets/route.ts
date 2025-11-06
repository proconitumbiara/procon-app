import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { ticketsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Buscar parâmetro status da query string (opcional)
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  // Se status for fornecido, filtrar por status; caso contrário, retornar todos
  const tickets = status
    ? await db.query.ticketsTable.findMany({
        where: eq(ticketsTable.status, status),
      })
    : await db.query.ticketsTable.findMany();

  return NextResponse.json({ tickets });
}
