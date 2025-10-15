import { NextRequest, NextResponse } from "next/server";

import { getTreatmentResolution } from "@/data/get-treatment-resolution";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const treatmentId = searchParams.get("treatmentId");

        if (!treatmentId) {
            return NextResponse.json(
                { error: "treatmentId é obrigatório" },
                { status: 400 }
            );
        }

        const resolution = await getTreatmentResolution(treatmentId);
        return NextResponse.json(resolution);
    } catch (error) {
        console.error("Erro ao buscar resolução:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
