"use client";

import Pusher from "pusher-js";
import { useCallback, useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EndOfShiftAlert() {
  const [open, setOpen] = useState(false);

  const handleAlert = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe("sistema");
    channel.bind("alerta-encerramento", handleAlert);

    return () => {
      channel.unbind("alerta-encerramento", handleAlert);
      pusher.unsubscribe("sistema");
      pusher.disconnect();
    };
  }, [handleAlert]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Lembrete de encerramento</AlertDialogTitle>
          <AlertDialogDescription>
            São 12h! Lembre-se de finalizar todos os atendimentos em andamento e
            encerrar sua operação antes do fim da jornada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setOpen(false)}>
            Entendido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
