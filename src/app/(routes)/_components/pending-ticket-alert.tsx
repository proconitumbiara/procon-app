"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { callNextTicket } from "@/actions/treatments/call-next-client";
import { usePusherChannel } from "@/hooks/use-pusher-channel";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime";

const ALERT_COOLDOWN_MS = 60000;
const COUNTDOWN_SECONDS = 15;

export default function PendingTicketAlert() {
  const [countdownOpen, setCountdownOpen] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(COUNTDOWN_SECONDS);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSoundTimestampRef = useRef<number>(0);
  const lastNotificationRef = useRef<number>(0);

  const { execute: executeCallNext, status: callNextStatus } = useAction(
    callNextTicket,
    {
      onSuccess: (result) => {
        const data = result?.data as { success?: boolean; error?: { message: string } } | undefined;
        if (data?.error) {
          toast.error(data.error.message);
        } else if (data?.success === true) {
          toast.success("Atendimento iniciado com sucesso!");
        }
        stopCountdownAndClose();
      },
      onError: (err) => {
        const msg =
          err?.error?.serverError ??
          (err?.error?.validationErrors?.formErrors?.[0]) ??
          "Erro ao iniciar atendimento";
        toast.error(msg);
        stopCountdownAndClose();
      },
    }
  );

  const playAlarm = useCallback(() => {
    try {
      const AudioContextClass =
        (window as unknown as { webkitAudioContext?: typeof window.AudioContext })
          .webkitAudioContext || window.AudioContext;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.type = "triangle";
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.18,
        audioContext.currentTime + 0.03
      );

      const startTime = audioContext.currentTime;
      const durationSec = 1.2;
      const endTime = startTime + durationSec;

      let t = startTime;
      let high = true;
      while (t < endTime) {
        const freq = high ? 900 : 700;
        oscillator.frequency.setValueAtTime(freq, t);
        t += 0.18;
        high = !high;
      }

      gainNode.gain.setValueAtTime(0.18, endTime - 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

      oscillator.start(startTime);
      oscillator.stop(endTime);

      setTimeout(() => {
        try {
          audioContext.close();
        } catch {}
      }, durationSec * 1000 + 150);
    } catch {
      // ignore audio errors
    }
  }, []);

  const stopCountdownAndClose = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdownSeconds(COUNTDOWN_SECONDS);
    setCountdownOpen(false);
  }, []);

  const checkEligibility = useCallback(async () => {
    try {
      const res = await fetch("/api/auto-call/check", {
        method: "GET",
        cache: "no-store",
      });
      if (res.status === 401) {
        setCountdownOpen(false);
        return;
      }
      const data = (await res.json()) as { showCountdown?: boolean };
      const showCountdown = Boolean(data?.showCountdown);

      if (showCountdown) {
        setCountdownOpen(true);
        setCountdownSeconds(COUNTDOWN_SECONDS);

        const now = Date.now();
        if (now - lastSoundTimestampRef.current >= ALERT_COOLDOWN_MS - 50) {
          playAlarm();
          lastSoundTimestampRef.current = now;
        }

        if (typeof window !== "undefined" && "Notification" in window) {
          if (now - lastNotificationRef.current > 5000) {
            if (Notification.permission === "granted") {
              new Notification("⚠️ Chamada automática em 15 segundos", {
                body: "Consumidores aguardando há mais de 10 minutos.",
              });
              lastNotificationRef.current = now;
            } else if (Notification.permission !== "denied") {
              Notification.requestPermission().then((perm) => {
                if (perm === "granted") {
                  new Notification("⚠️ Chamada automática em 15 segundos", {
                    body: "Consumidores aguardando há mais de 10 minutos.",
                  });
                  lastNotificationRef.current = Date.now();
                }
              });
            }
          }
        }
      } else {
        setCountdownOpen(false);
      }
    } catch {
      // ignore network errors
    }
  }, [playAlarm]);

  useEffect(() => {
    checkEligibility();
  }, [checkEligibility]);

  const ticketsHandlers = useMemo(
    () => ({
      [REALTIME_EVENTS.ticketsChanged]: () => checkEligibility(),
      [REALTIME_EVENTS.ticketCreated]: () => checkEligibility(),
      [REALTIME_EVENTS.ticketUpdated]: () => checkEligibility(),
    }),
    [checkEligibility],
  );
  const operationsHandlers = useMemo(
    () => ({
      [REALTIME_EVENTS.autoCallCheck]: () => checkEligibility(),
      [REALTIME_EVENTS.operationStarted]: () => checkEligibility(),
      [REALTIME_EVENTS.operationPaused]: () => checkEligibility(),
      [REALTIME_EVENTS.operationResumed]: () => checkEligibility(),
      [REALTIME_EVENTS.operationFinished]: () => checkEligibility(),
    }),
    [checkEligibility],
  );
  usePusherChannel(REALTIME_CHANNELS.tickets, ticketsHandlers);
  usePusherChannel(REALTIME_CHANNELS.operations, operationsHandlers);

  const executeCallNextRef = useRef(executeCallNext);
  executeCallNextRef.current = executeCallNext;
  const hasTriggeredCallRef = useRef(false);

  useEffect(() => {
    if (!countdownOpen) return;
    hasTriggeredCallRef.current = false;

    countdownIntervalRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          if (!hasTriggeredCallRef.current) {
            hasTriggeredCallRef.current = true;
            setTimeout(() => executeCallNextRef.current(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [countdownOpen]);

  const onCancelCountdown = useCallback(() => {
    stopCountdownAndClose();
  }, [stopCountdownAndClose]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const originalTitle = document.title;
    let interval: ReturnType<typeof setInterval> | null = null;

    if (countdownOpen && document.hidden) {
      interval = setInterval(() => {
        document.title =
          document.title === "⚠️ Chamada automática em breve!"
            ? originalTitle
            : "⚠️ Chamada automática em breve!";
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
      document.title = originalTitle;
    };
  }, [countdownOpen]);

  if (!countdownOpen) return null;

  return (
    <Dialog open={countdownOpen} onOpenChange={(open) => !open && onCancelCountdown()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Chamada automática do próximo atendimento</DialogTitle>
          <DialogDescription>
            Existem consumidores aguardando há mais de 10 minutos. O próximo
            ticket será chamado automaticamente em{" "}
            <strong>{countdownSeconds}</strong> segundo
            {countdownSeconds !== 1 ? "s" : ""}. Você pode cancelar para chamar
            manualmente.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 text-center text-3xl font-semibold tabular-nums">
          {countdownSeconds}s
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancelCountdown}
            disabled={callNextStatus === "executing"}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
