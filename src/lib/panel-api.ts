"use server";

interface Cliente {
  nome: string;
  guiche: string;
  chamadoEm?: string;
}

/**
 * Envia dados da chamada para o servidor HTTP/WebSocket
 * @param cliente - Dados do cliente que está sendo chamado
 */
export async function sendToPanel(cliente: Cliente) {
  try {
    // Verifica se PANEL_API_URL está definido
    const panelApiUrl = process.env.PANEL_API_URL;
    if (!panelApiUrl) {
      console.warn("PANEL_API_URL não está definido no .env");
      return;
    }

    // Remove trailing slash se existir
    const baseUrl = panelApiUrl.replace(/\/$/, "");
    const apiUrl = `${baseUrl}/call`;

    // Formata os dados no formato esperado pelo servidor WebSocket
    const payload = {
      nome: cliente.nome,
      guiche: cliente.guiche,
      ...(cliente.chamadoEm && { chamadoEm: cliente.chamadoEm }),
    };

    // Log para debug
    console.log("[WebSocket Server] Enviando para:", apiUrl);
    console.log(
      "[WebSocket Server] Payload:",
      JSON.stringify(payload, null, 2),
    );

    // Envia para o servidor HTTP/WebSocket
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Erro desconhecido");
      console.error(
        `[WebSocket Server] Erro ao enviar dados: ${response.status} ${response.statusText}`,
        errorText,
      );
    } else {
      const responseData = await response.json().catch(() => null);
      console.log(
        "[WebSocket Server] Dados enviados com sucesso:",
        responseData,
      );
    }
  } catch (error) {
    // Trata erros silenciosamente para não quebrar o fluxo principal
    console.error("[WebSocket Server] Erro ao enviar dados:", error);
    if (error instanceof Error) {
      console.error("[WebSocket Server] Stack trace:", error.stack);
    }
  }
}
