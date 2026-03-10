"use server";

import { pusherServer } from "@/lib/pusher-server";

export interface ChamadaCliente {
  nome: string;
  guiche: string;
  chamadoEm?: string;
  setor?: string;
  prioridade?: "Comum" | "Prioritário";
}

export async function sendToPanel(cliente: ChamadaCliente): Promise<void> {
  await pusherServer.trigger("painel", "nova-chamada", {
    nome: cliente.nome,
    guiche: cliente.guiche,
    ...(cliente.chamadoEm && { chamadoEm: cliente.chamadoEm }),
    ...(cliente.setor && { setor: cliente.setor }),
    ...(cliente.prioridade && { prioridade: cliente.prioridade }),
  });
}

export async function sendLastCalledToPanel(
  clientes: ChamadaCliente[]
): Promise<void> {
  await pusherServer.trigger("painel", "ultimas-chamadas", clientes.slice(0, 5));
}
