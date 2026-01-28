import { NextRequest, NextResponse } from "next/server";

import { getProfessionalMetrics } from "@/data/get-professional-metrics";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    const metrics = await getProfessionalMetrics({
      professionalId: id,
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
