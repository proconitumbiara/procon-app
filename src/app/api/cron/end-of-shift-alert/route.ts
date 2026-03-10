import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { pusherServer } from "@/lib/pusher-server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await pusherServer.trigger("sistema", "alerta-encerramento", {});

  return NextResponse.json({ sent: true });
}
