"use client";

import { useEffect, useRef } from "react";

type TicketUpdateCallback = () => void;

export function useTicketsWebSocket(onTicketUpdate: TicketUpdateCallback) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(onTicketUpdate);

  // Atualizar callback ref quando mudar
  useEffect(() => {
    callbackRef.current = onTicketUpdate;
  }, [onTicketUpdate]);

  useEffect(() => {
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;

      // Determinar a URL do WebSocket baseada no ambiente
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsHost = process.env.NEXT_PUBLIC_WS_URL || window.location.hostname;
      const wsPort = process.env.NEXT_PUBLIC_WS_PORT || "8080";
      const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}`;

      try {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!isMounted) {
            ws.close();
            return;
          }
          console.log("WebSocket conectado para atualizações de tickets");
          // Limpar timeout de reconexão se existir
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            // Verificar se é uma atualização de ticket (ticket-created ou ticket-updated)
            if (
              data.type === "ticket-created" ||
              data.type === "ticket-updated"
            ) {
              // Chamar callback para atualizar a lista
              callbackRef.current();
            }
          } catch (error) {
            console.error("Erro ao processar mensagem WebSocket:", error);
          }
        };

        ws.onerror = () => {
          // Erro será tratado no onclose - não mostrar erro vazio
          // O WebSocket tentará reconectar automaticamente
        };

        ws.onclose = (event) => {
          if (!isMounted) return;

          // Não tentar reconectar se foi fechado intencionalmente (código 1000)
          if (event.code === 1000) {
            return;
          }

          // Tentar reconectar após 3 segundos
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMounted) {
              connect();
            }
          }, 3000);
        };

        wsRef.current = ws;
      } catch {
        if (!isMounted) return;
        // Tentar reconectar após 5 segundos em caso de erro
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMounted) {
            connect();
          }
        }, 5000);
      }
    };

    connect();

    // Cleanup ao desmontar
    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close(1000); // Código 1000 = fechamento normal
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, []);
}
