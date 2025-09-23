import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";

export async function GET() {
  try {
    const professionals = await db.query.usersTable.findMany({
      where: (row) => eq(row.role, "professional"),
    });

    return NextResponse.json(professionals);
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
