import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 }); // Porta pode ser configurada

// Função para broadcast de atualizações de tickets
export function broadcastTicketUpdate(data: {
  type: "ticket-created" | "ticket-updated";
  ticketId?: string;
}) {
  const payload = JSON.stringify({ type: data.type, ticketId: data.ticketId });
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

export default wss;
