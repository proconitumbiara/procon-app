import { NextRequest, NextResponse } from "next/server";

import { getProfessionalMetrics } from "@/data/get-professional-metrics";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    let dateFilter;
    if (date) {
      const selectedDate = new Date(date);
      dateFilter = {
        from: new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
        ),
        to: new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          23,
          59,
          59,
        ),
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
