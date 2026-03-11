import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { operationsTable, treatmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verifica se existe atendimento (treatment) em andamento ligado a alguma operação ativa do usuário
    const operation = await db.query.operationsTable.findFirst({
        where: and(
            eq(operationsTable.userId, session.user.id),
            inArray(operationsTable.status, ["operating", "in-attendance"]),
        ),
    });

    if (!operation) {
        return NextResponse.json({ inService: false, hasActiveOperation: false });
    }

    const treatment = await db.query.treatmentsTable.findFirst({
        where: and(
            eq(treatmentsTable.operationId, operation.id),
            eq(treatmentsTable.status, "in_service"),
        ),
    });

    return NextResponse.json({ inService: Boolean(treatment), hasActiveOperation: true });
}


