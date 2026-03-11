import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (session.user.role !== "administrator") {
    return NextResponse.json(
      { error: "Acesso negado. Apenas administradores podem listar profissionais." },
      { status: 403 },
    );
  }

  try {
    const professionals = await db.query.usersTable.findMany();

    return NextResponse.json(professionals);
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
