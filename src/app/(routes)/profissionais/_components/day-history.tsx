"use client";

import { CheckCircle2, Clock, MonitorCheck, Pause, PhoneCall } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateInSaoPaulo } from "@/lib/timezone-utils";

type HistoryItem =
  | {
    type: "operation_start";
    id: string;
    date: Date | string;
    label: string;
  }
  | {
    type: "operation_finish";
    id: string;
    date: Date | string;
    label: string;
  }
  | {
    type: "treatment";
    id: string;
    date: Date | string;
    label: string;
  }
  | {
    type: "pause";
    id: string;
    date: Date | string;
    label: string;
    reason: string;
    duration: number;
  };

interface Operation {
  id: string;
  createdAt: Date | string;
  finishedAt?: Date | string | null;
  treatments: Array<{
    id: string;
    createdAt: Date | string;
  }>;
  pauses: Array<{
    id: string;
    reason: string;
    duration: number;
    createdAt: Date | string;
  }>;
}

interface DayHistoryProps {
  operations: Operation[];
}

const formatTime = (minutes: number) => {
  if (minutes <= 0) return "~1min";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
};

const buildHistoryItems = (operations: Operation[]): HistoryItem[] => {
  const raw: HistoryItem[] = [];
  let treatmentIndex = 0;

  for (const op of operations) {
    raw.push({
      type: "operation_start",
      id: op.id,
      date: op.createdAt,
      label: "Início da operação",
    });

    for (const t of op.treatments || []) {
      treatmentIndex += 1;
      raw.push({
        type: "treatment",
        id: t.id,
        date: t.createdAt,
        label: `Atendimento ${String(treatmentIndex).padStart(2, "0")}`,
      });
    }

    for (const p of op.pauses || []) {
      raw.push({
        type: "pause",
        id: p.id,
        date: p.createdAt,
        label: "Pausa",
        reason: p.reason,
        duration: p.duration,
      });
    }

    if (op.finishedAt) {
      raw.push({
        type: "operation_finish",
        id: `${op.id}-finish`,
        date: op.finishedAt,
        label: "Encerramento da operação",
      });
    }
  }

  return raw.sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });
};

const DayHistory = ({ operations }: DayHistoryProps) => {
  const items = buildHistoryItems(operations);

  const formatDate = (date: Date | string) =>
    formatDateInSaoPaulo(date, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  if (operations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico do dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-4 text-center text-sm">
            Nenhum registro para exibir. Selecione um período com operações.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Histórico do dia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {items.map((item, index) => (
            <div key={`${item.type}-${item.id}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${item.type === "operation_start"
                      ? "border-blue-600 bg-blue-500/10"
                      : item.type === "operation_finish"
                        ? "border-primary bg-primary/10"
                        : item.type === "treatment"
                          ? "border-green-600 bg-green-500/10"
                          : "border-amber-600 bg-amber-500/10"
                    }`}
                >
                  {item.type === "operation_start" ? (
                    <MonitorCheck className="h-4 w-4 text-blue-600" />
                  ) : item.type === "operation_finish" ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : item.type === "treatment" ? (
                    <PhoneCall className="h-4 w-4 text-green-600" />
                  ) : (
                    <Pause className="h-4 w-4 text-amber-600" />
                  )}
                </div>
                {index < items.length - 1 && (
                  <div className="bg-border mt-1 h-full min-h-[8px] w-0.5 flex-1" />
                )}
              </div>
              <div className="pb-5">
                <div className="text-muted-foreground text-xs">
                  {formatDate(item.date)}
                </div>
                <div className="font-medium">{item.label}</div>
                {item.type === "pause" && (
                  <div className="text-muted-foreground mt-0.5 text-xs">
                    {item.reason} · {formatTime(item.duration)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DayHistory;
