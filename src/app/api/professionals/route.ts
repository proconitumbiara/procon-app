import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { buildUserPermissions } from "@/lib/authorization";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const perms = buildUserPermissions({
    id: session.user.id,
    role: session.user.role,
    profile: (session.user as any).profile,
  });

  // Apenas administradores/supervisores podem listar profissionais
  if (session.user.role !== "administrator" && session.user.role !== "developer") {
    return NextResponse.json(
      { error: "Acesso negado. Apenas administradores podem listar profissionais." },
      { status: 403 },
    );
  }

  try {
    const professionalsRaw = await db.query.usersTable.findMany();

    // Regra do doc:
    // - supervisor-atendimento: vê apenas tecnico-atendimento e tecnico-geral
    // - supervisor-juridico: vê apenas tecnico-juridico e tecnico-geral
    // - developer/administrator (outros perfis): vê todos
    const professionals = professionalsRaw.filter((user) => {
      const profile = user.profile as string | null;

      if (perms.profile === "supervisor-atendimento") {
        return (
          profile === "tecnico-atendimento" ||
          profile === "tecnico-geral"
        );
      }

      if (perms.profile === "supervisor-juridico") {
        return (
          profile === "tecnico-juridico" ||
          profile === "tecnico-geral"
        );
      }

      // Outros administradores/desenvolvedores enxergam todos
      return true;
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
