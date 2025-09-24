"use client";
import { MonitorX } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { finishOperation } from "@/actions/finish-operation";
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
import {
  clientsTable,
  operationsTable,
  sectorsTable,
  servicePointsTable,
  ticketsTable,
  treatmentsTable,
  usersTable,
} from "@/db/schema";
import { formatCPF } from "@/lib/utils";

interface OperationCardProps {
  operations: (typeof operationsTable.$inferSelect & {
    servicePoint: typeof servicePointsTable.$inferSelect & {
      sector: typeof sectorsTable.$inferSelect;
    };
    user: typeof usersTable.$inferSelect;
    treatments: (typeof treatmentsTable.$inferSelect & {
      ticket: typeof ticketsTable.$inferSelect & {
        client: typeof clientsTable.$inferSelect;
      };
    })[];
  })[];
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
            <Badge className="absolute top-3 right-3 bg-green-500 text-white">
              Operando
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
              {operation.createdAT
                ? new Date(operation.createdAT).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })
                : "-"}{" "}
              <span className="text-foreground font-semibold">Horário:</span>{" "}
              {operation.createdAT
                ? new Date(operation.createdAT).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "-"}
              {operation.createdAT && (
                <OperationTimer createdAt={operation.createdAT} />
              )}
            </p>
          </CardHeader>
          <Separator />
          <CardContent className="flex-1 flex flex-col">
            {/* Seção de atendimentos em andamento */}
            {operation.treatments && operation.treatments.length > 0 ? (
              <div className="flex-1 bg-background/10 flex flex-col justify-between h-full">
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
                      {treatment.createdAT
                        ? new Date(treatment.createdAT).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })
                        : "-"}{" "}
                      <span className="text-foreground font-semibold">às</span>{" "}
                      {treatment.createdAT
                        ? new Date(treatment.createdAT).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "-"}
                    </p>
                    {treatment.createdAT && (
                      <TreatmentTimer createdAt={treatment.createdAT} />
                    )}
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
                  Aguardando chamada do próximo cliente
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
