"use client";
import { MonitorX } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { finishOperation } from "@/actions/operations/finish-operation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCPF } from "@/lib/utils";
import { formatDateInSaoPaulo } from "@/lib/timezone-utils";
import AttendanceDurationTimer from "../../atendimento/_components/attendance-duration-timer";

const saoPauloTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

interface OperationClient {
  id: string;
  name: string;
  register: string;
}

interface OperationTicket {
  id: string;
  priority: number;
  client: OperationClient | null;
}

interface OperationTreatment {
  id: string;
  status: string;
  duration: number | null;
  createdAt: Date | string;
  ticket: OperationTicket | null;
}

interface OperationServicePoint {
  id: string;
  name: string;
  sectorId: string;
  sector: { id: string; name: string } | null;
}

interface OperationUser {
  id: string;
  name: string;
  cpf: string | null;
}

interface Operation {
  id: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string | null;
  servicePoint: OperationServicePoint | null;
  user: OperationUser | null;
  treatments: OperationTreatment[];
}

interface OperationCardProps {
  operations: Operation[];
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
}

const OperationTimer = ({ createdAt }: { createdAt: string | Date }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const start = new Date(createdAt).getTime();
  const diff = now - start;
  return (
    <span className="text-foreground flex flex-row gap-1 text-sm font-semibold">
      Tempo de operação:{" "}
      <p className="text-foreground font-light">
        {formatDuration(diff)}
      </p>
    </span>
  );
};

const TreatmentTimer = ({ createdAt }: { createdAt: string | Date }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const start = new Date(createdAt).getTime();
  const diff = now - start;
  return (
    <span className="text-foreground flex flex-row gap-1 text-sm font-semibold">
      Tempo de atendimento:{" "}
      <p className="text-foreground font-normal">
        {formatDuration(diff)}
      </p>
    </span>
  );
};

const FinishOperationAlertButton = ({
  operationId,
}: {
  operationId: string;
}) => {
  const [open, setOpen] = useState(false);
  const { execute, status } = useAction(finishOperation, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        return;
      }
      toast.success("Operação encerrada com sucesso!");
      setOpen(false);
    },
    onError: (err) => {
      const msg =
        err.error?.serverError ||
        err.error?.validationErrors?.operationId?._errors?.[0] ||
        "Erro ao encerrar operação";
      toast.error(msg);
    },
  });
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="default"
          className="w-auto"
          disabled={status === "executing"}
        >
          Encerrar operação
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja encerrar esta operação?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={status === "executing"}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={status === "executing"}
            onClick={() => execute({ operationId })}
          >
            Encerrar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const OperationsCard = ({ operations }: OperationCardProps) => {
  return (
    <div className="flex w-full flex-wrap gap-6">
      {operations.map((operation) => (
        <Card
          key={operation.id}
          className="relative flex w-full max-w-md min-w-[30px] flex-col h-[400px]"
        >
          {operation && (
            <Badge
              className={
                operation.status === "in-attendance"
                  ? "absolute top-3 right-3 bg-blue-500 text-white"
                  : "absolute top-3 right-3 bg-green-500 text-white"
              }
            >
              {operation.status === "in-attendance"
                ? "Ativa - Em atendimento"
                : "Ativa - Disponível"}
            </Badge>
          )}
          <CardHeader className="flex flex-col">
            <h3 className="text-base text-primary font-semibold">
              {operation.user?.name || "-"}
            </h3>
            <p className="text-foreground text-sm font-semibold">
              {operation.servicePoint?.sector?.name || "-"} -{" "}
              {operation.servicePoint?.name || "-"}
            </p>
            <p className="text-foreground text-sm font-light">
              <span className="text-foreground font-semibold">Início:</span>{" "}
              {operation.createdAt
                ? formatDateInSaoPaulo(operation.createdAt, {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })
                : "-"}{" "}
              <span className="text-foreground font-semibold">Horário:</span>{" "}
              {operation.createdAt
                ? saoPauloTimeFormatter.format(new Date(operation.createdAt))
                : "-"}
              {operation.createdAt && (
                <OperationTimer createdAt={operation.createdAt} />
              )}
            </p>
          </CardHeader>
          <Separator />
          <CardContent className="flex-1 flex flex-col">
            {/* Seção de atendimentos em andamento */}
            {operation.treatments && operation.treatments.length > 0 ? (
              <div className="flex-1 bg-transparent flex flex-col justify-between h-full">
                <h3 className="text-base text-primary font-semibold mb-2">
                  Atendimento em Andamento
                </h3>
                {operation.treatments.map((treatment) => (
                  <div key={treatment.id} className="space-y-2 flex-1">
                    <p className="text-sm">
                      <span className="text-foreground font-semibold">Consumidor:</span>{" "}
                      {treatment.ticket?.client?.name || "-"}
                    </p>
                    <p className="text-sm">
                      <span className="text-foreground font-semibold">CPF:</span>{" "}
                      {treatment.ticket?.client?.register ? formatCPF(treatment.ticket?.client?.register) : "-"}
                    </p>
                    <p className="text-sm">
                      <span className="text-foreground font-semibold">Início do atendimento:</span>{" "}
                      {treatment.createdAt
                        ? formatDateInSaoPaulo(treatment.createdAt, {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })
                        : "-"}{" "}
                    </p>
                    <p className="text-sm">
                      <span className="text-foreground font-semibold">Duração:</span>{" "}
                      <AttendanceDurationTimer createdAt={treatment.createdAt} />
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 p-3 bg-background/10 rounded-lg border border-border flex flex-col justify-center items-center h-full">
                <div className="flex items-center gap-2 mb-2">
                  <MonitorX className="w-4 h-4" />
                  <p className="text-sm text-foreground font-medium">
                    Nenhum atendimento em andamento
                  </p>
                </div>
                <p className="text-xs text-foreground text-center">
                  Aguardando chamada do próximo consumidor
                </p>
              </div>
            )}
          </CardContent>
          <Separator />
          <CardFooter className="flex items-center justify-center">
            <FinishOperationAlertButton operationId={operation.id} />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default OperationsCard;
