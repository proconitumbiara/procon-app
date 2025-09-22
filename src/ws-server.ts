import { WebSocket,WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 }); // Porta pode ser configurada

export function broadcastToPanels(data: {
  nomeCliente: string;
  guiche: string;
}) {
  const payload = JSON.stringify({ type: "chamada-cliente", ...data });
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

export default wss;
