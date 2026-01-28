/**
 * Utilitários para conversão de timezone
 * Converte entre UTC (banco de dados) e America/Sao_Paulo (exibição)
 */

/**
 * Converte uma data UTC para o horário de São Paulo
 * @param date Data em UTC
 * @returns String formatada no timezone de São Paulo
 */
export function formatDateInSaoPaulo(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  return dateObj.toLocaleDateString("pt-BR", defaultOptions);
}

/**
 * Converte uma data do horário de São Paulo para UTC
 * Útil quando o usuário seleciona uma data/hora local e precisamos enviar para o banco
 * @param date Data no horário de São Paulo
 * @returns Date em UTC
 */
export function convertSaoPauloToUTC(date: Date): Date {
  // Cria uma string ISO no timezone de São Paulo
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  // Cria uma data interpretando como se fosse em São Paulo
  const dateString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;

  // Usa Intl.DateTimeFormat para converter corretamente
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Cria uma data UTC equivalente
  const parts = formatter.formatToParts(date);
  const utcDate = new Date(
    Date.UTC(
      parseInt(parts.find((p) => p.type === "year")?.value || "0"),
      parseInt(parts.find((p) => p.type === "month")?.value || "0") - 1,
      parseInt(parts.find((p) => p.type === "day")?.value || "0"),
      parseInt(parts.find((p) => p.type === "hour")?.value || "0"),
      parseInt(parts.find((p) => p.type === "minute")?.value || "0"),
      parseInt(parts.find((p) => p.type === "second")?.value || "0"),
    ),
  );

  // Ajusta para o offset correto
  const offsetSP = -3 * 60; // UTC-3 em minutos
  const offsetUTC = 0;
  const offsetDiff = offsetSP - offsetUTC;

  return new Date(utcDate.getTime() - offsetDiff * 60 * 1000);
}

/**
 * Cria uma data no início do dia em São Paulo e retorna em UTC
 * @param date Data de referência (no timezone local do navegador)
 * @returns Date UTC representando 00:00:00 em São Paulo
 */
export function getStartOfDayInSaoPauloUTC(date: Date): Date {
  // Obtém a data formatada em São Paulo para garantir que estamos usando o dia correto
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const dateStr = formatter.format(date);
  const [year, month, day] = dateStr.split("-").map(Number);

  // Cria uma string ISO representando 00:00:00 em São Paulo
  // Usamos uma abordagem simples: criar uma data UTC e calcular o offset
  // Para isso, criamos uma data de teste e vemos a diferença
  const testDateUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));

  // Obtém como essa data seria representada em São Paulo
  const spFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const spParts = spFormatter.formatToParts(testDateUTC);
  const spYear = parseInt(
    spParts.find((p) => p.type === "year")?.value || String(year),
  );
  const spMonth = parseInt(
    spParts.find((p) => p.type === "month")?.value || String(month),
  );
  const spDay = parseInt(
    spParts.find((p) => p.type === "day")?.value || String(day),
  );
  const spHour = parseInt(
    spParts.find((p) => p.type === "hour")?.value || "12",
  );

  // Calcula o offset: diferença entre UTC e SP
  const spDateUTC = new Date(
    Date.UTC(spYear, spMonth - 1, spDay, spHour, 0, 0, 0),
  );
  const offset = testDateUTC.getTime() - spDateUTC.getTime();

  // Aplica o offset à data de início do dia (00:00:00 em SP)
  const startOfDayUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  return new Date(startOfDayUTC.getTime() - offset);
}

/**
 * Cria uma data no fim do dia em São Paulo e retorna em UTC
 * @param date Data de referência (no timezone local do navegador)
 * @returns Date UTC representando 23:59:59.999 em São Paulo
 */
export function getEndOfDayInSaoPauloUTC(date: Date): Date {
  // Obtém a data formatada em São Paulo
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const dateStr = formatter.format(date);
  const [year, month, day] = dateStr.split("-").map(Number);

  // Calcula o offset da mesma forma
  const testDateUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));

  const spFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const spParts = spFormatter.formatToParts(testDateUTC);
  const spYear = parseInt(
    spParts.find((p) => p.type === "year")?.value || String(year),
  );
  const spMonth = parseInt(
    spParts.find((p) => p.type === "month")?.value || String(month),
  );
  const spDay = parseInt(
    spParts.find((p) => p.type === "day")?.value || String(day),
  );
  const spHour = parseInt(
    spParts.find((p) => p.type === "hour")?.value || "12",
  );

  const spDateUTC = new Date(
    Date.UTC(spYear, spMonth - 1, spDay, spHour, 0, 0, 0),
  );
  const offset = testDateUTC.getTime() - spDateUTC.getTime();

  // Aplica o offset à data de fim do dia (23:59:59.999 em SP)
  const endOfDayUTC = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  return new Date(endOfDayUTC.getTime() - offset);
}

/**
 * Converte uma data UTC para Date no horário de São Paulo (para cálculos)
 * @param date Data em UTC
 * @returns Date ajustada para representar o horário de São Paulo
 */
export function convertUTCToSaoPaulo(date: Date): Date {
  // Cria uma nova data subtraindo 3 horas (UTC-3)
  return new Date(date.getTime() - 3 * 60 * 60 * 1000);
}
