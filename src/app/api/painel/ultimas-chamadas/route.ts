import { getUltimasChamadasFromDb } from "@/actions/treatments/call-next-client/send-last-called-clients";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const chamadas = await getUltimasChamadasFromDb();
    return NextResponse.json(chamadas);
  } catch (error) {
    console.error("[api/painel/ultimas-chamadas]", error);
    return NextResponse.json(
      { error: "Falha ao carregar últimas chamadas" },
      { status: 500 },
    );
  }
}
