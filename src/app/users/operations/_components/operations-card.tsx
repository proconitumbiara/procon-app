"use client";
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
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  operationsTable,
  sectorsTable,
  servicePointsTable,
  usersTable,
} from "@/db/schema";

interface OperationCardProps {
  operations: (typeof operationsTable.$inferSelect & {
    servicePoint: typeof servicePointsTable.$inferSelect & {
      sector: typeof sectorsTable.$inferSelect;
    };
    user: typeof usersTable.$inferSelect;
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
    <span className="text-primary flex flex-row gap-1 text-sm font-semibold">
      Tempo de operação:{" "}
      <p className="text-muted-foreground font-normal">
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
          className="relative flex w-full max-w-md min-w-[30px] flex-col"
        >
          {operation && (
            <Badge className="absolute top-3 right-3 bg-green-500">
              Operando
            </Badge>
          )}
          <CardHeader className="flex flex-col">
            <h3 className="text-base font-semibold">
              {operation.user?.name || "-"} -{" "}
              {operation.servicePoint?.name || "-"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {operation.servicePoint?.sector?.name || "-"}
            </p>
            <p className="text-muted-foreground text-sm">
              <span className="text-primary font-semibold">Início:</span>{" "}
              {operation.createdAT
                ? new Date(operation.createdAT).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })
                : "-"}{" "}
              <span className="text-primary font-semibold">Horário:</span>{" "}
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
          <CardFooter className="flex items-center justify-center">
            <FinishOperationAlertButton operationId={operation.id} />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default OperationsCard;
