import { NextRequest, NextResponse } from "next/server";

import { getProfessionalMetrics } from "@/data/get-professional-metrics";
import { auth } from "@/lib/auth";
import { buildUserPermissions } from "@/lib/authorization";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  if (
    session.user.role === "professional" &&
    id !== session.user.id
  ) {
    return NextResponse.json(
      { error: "Acesso negado. Você só pode consultar suas próprias métricas." },
      { status: 403 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    let dateFilter;
    if (fromParam && toParam) {
      // As datas já vêm em UTC do frontend
      dateFilter = {
        from: new Date(fromParam),
        to: new Date(toParam),
      };
    }

    const perms = buildUserPermissions({
      id: session.user.id,
      role: session.user.role,
      profile: (session.user as any).profile,
    });

    const sectorKeyNames =
      perms.sectorKeyFilter.length === 1 && perms.sectorKeyFilter[0] === "*"
        ? null
        : (perms.sectorKeyFilter as string[]);

    const metrics = await getProfessionalMetrics({
      professionalId: id,
      sectorKeyNames,
      ...dateFilter,
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Erro ao buscar métricas do profissional:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
