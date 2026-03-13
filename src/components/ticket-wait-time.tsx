"use client";

import { useEffect, useState } from "react";

function formatDurationMs(ms: number): string {
  if (ms < 0) return "-";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}min`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(" ");
}

export type TicketWaitTimeProps = {
  status: string;
  createdAt: Date;
  calledAt: Date | null;
  finishedAt?: Date | null;
  /** Atualiza a cada segundo quando status === "pending". Default true. */
  live?: boolean;
  className?: string;
};

/**
 * Exibe o tempo de espera do ticket.
 * - pending: contador em tempo real (desde createdAt).
 * - finished: tempo total de espera (createdAt até calledAt).
 * - cancelled: tempo de espera até o cancelamento (createdAt até finishedAt).
 */
export function TicketWaitTime({
  status,
  createdAt,
  calledAt,
  finishedAt,
  live = true,
  className,
}: TicketWaitTimeProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (status !== "pending" || !live) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [status, live]);

  if (status === "cancelled") {
    const end = finishedAt ? new Date(finishedAt).getTime() : null;
    if (end == null) return <span className={className}>-</span>;
    const start = new Date(createdAt).getTime();
    return <span className={className}>{formatDurationMs(end - start)}</span>;
  }

  if (status === "finished") {
    const start = new Date(createdAt).getTime();
    const end = calledAt ? new Date(calledAt).getTime() : start;
    const ms = end - start;
    return <span className={className}>{formatDurationMs(ms)}</span>;
  }

  if (status === "pending") {
    const start = new Date(createdAt).getTime();
    const end = now.getTime();
    const ms = end - start;
    return <span className={className}>{formatDurationMs(ms)}</span>;
  }

  return null;
}
