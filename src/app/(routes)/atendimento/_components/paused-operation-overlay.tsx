"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { endPause } from "@/actions/pauses/end-pause";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

interface PausedOperationOverlayProps {
  isPaused: boolean;
  pause: { id: string; createdAt: Date } | null;
}

const PausedOperationOverlay = ({ isPaused, pause }: PausedOperationOverlayProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!pause) return;
    const start =
      pause.createdAt instanceof Date
        ? pause.createdAt.getTime()
        : new Date(pause.createdAt).getTime();

    const update = () => setElapsed(Date.now() - start);
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [pause?.id, pause?.createdAt]);

  const { execute, status } = useAction(endPause, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast.error(result.data.error.message);
        return;
      }
      toast.success("Pausa encerrada.");
    },
    onError: () => {
      toast.error("Erro ao encerrar pausa.");
    },
  });

  const handleEndPause = () => {
    if (pause) execute({ pauseId: pause.id });
  };

  if (!isPaused || !pause) return null;

  return (
    <Dialog open={true}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 sm:max-w-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Operação pausada</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-2">
            <p className="text-muted-foreground text-sm">Tempo em pausa</p>
            <p className="font-mono text-3xl tabular-nums">
              {formatElapsed(elapsed)}
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={handleEndPause}
              disabled={status === "executing"}
            >
              {status === "executing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Encerrando...
                </>
              ) : (
                "Encerrar pausa"
              )}
            </Button>
          </DialogFooter>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
};

export default PausedOperationOverlay;
