"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const POLLING_INTERVAL_MS = 20000; // 30s
const DISPLAY_DURATION_MS = 10000; // 10s na tela

export default function PendingTicketAlert() {
    const [, setHasPending] = useState(false);
    const [open, setOpen] = useState(false);
    const lastSoundTimestampRef = useRef<number>(0);
    const autoCloseTimeoutRef = useRef<number | null>(null);
    const lastNotificationRef = useRef<number>(0);

    const playAlarm = useCallback(() => {
        // Alarme mais suave: onda triangular, volume menor e alternância mais lenta
        try {
            const AudioContextClass = (window as unknown as { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext || window.AudioContext;
            const audioContext = new AudioContextClass();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.type = "triangle"; // timbre mais suave que square
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Envelope suave com volume moderado
            gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.03);

            const startTime = audioContext.currentTime;
            const durationSec = 1.2; // duração do alarme
            const endTime = startTime + durationSec;

            // Alternar frequência entre 900Hz e 700Hz a cada 180ms
            let t = startTime;
            let high = true;
            while (t < endTime) {
                const freq = high ? 900 : 700;
                oscillator.frequency.setValueAtTime(freq, t);
                t += 0.18;
                high = !high;
            }

            // Release suave
            gainNode.gain.setValueAtTime(0.18, endTime - 0.08);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

            oscillator.start(startTime);
            oscillator.stop(endTime);

            setTimeout(() => {
                try {
                    audioContext.close();
                } catch { }
            }, durationSec * 1000 + 150);
        } catch {
            // ignore audio errors
        }
    }, []);

    const checkPending = useCallback(async () => {
        try {
            const [ticketsRes, activeRes] = await Promise.all([
                fetch("/api/tickets", { method: "GET", cache: "no-store" }),
                fetch("/api/treatments/active", { method: "GET", cache: "no-store" }),
            ]);
            if (ticketsRes.status === 401 || activeRes.status === 401) {
                setHasPending(false);
                setOpen(false);
                return;
            }
            const ticketsData = (await ticketsRes.json()) as { tickets?: Array<unknown> };
            const activeData = (await activeRes.json()) as { inService?: boolean; hasActiveOperation?: boolean };
            const hasPendingTickets = Array.isArray(ticketsData.tickets) && ticketsData.tickets.length > 0;
            const hasActiveService = Boolean(activeData?.inService);
            const hasActiveOperation = Boolean(activeData?.hasActiveOperation);

            const shouldAlert = hasPendingTickets && hasActiveOperation && !hasActiveService;
            setHasPending(shouldAlert);
            setOpen(shouldAlert);
            if (shouldAlert) {
                const now = Date.now();
                if (now - lastSoundTimestampRef.current >= POLLING_INTERVAL_MS - 50) {
                    playAlarm();
                    lastSoundTimestampRef.current = now;
                }
                // Notificação web (mesmo se aba fechada/oculta)
                const canNotify = typeof window !== "undefined" && "Notification" in window;
                if (canNotify && now - lastNotificationRef.current > 5000) {
                    if (Notification.permission === "granted") {
                        new Notification("⚠️ Atendimento pendente", {
                            body: "Há consumidores aguardando atendimento.",
                        });
                        lastNotificationRef.current = now;
                    } else if (Notification.permission !== "denied") {
                        Notification.requestPermission().then((perm) => {
                            if (perm === "granted") {
                                new Notification("⚠️ Atendimento pendente", {
                                    body: "Há consumidores aguardando atendimento.",
                                });
                                lastNotificationRef.current = Date.now();
                            }
                        });
                    }
                }
                // agendar auto-fechamento em 10s
                if (autoCloseTimeoutRef.current) {
                    clearTimeout(autoCloseTimeoutRef.current);
                }
                autoCloseTimeoutRef.current = window.setTimeout(() => {
                    setOpen(false);
                }, DISPLAY_DURATION_MS);
            }
        } catch {
            // ignore network errors to avoid noise
        }
    }, [playAlarm]);

    useEffect(() => {
        // Initial check immediately
        checkPending();
        const intervalId = setInterval(checkPending, POLLING_INTERVAL_MS);
        return () => clearInterval(intervalId);
    }, [checkPending]);

    const onAcknowledge = useCallback(() => {
        // usuário pode dispensar; dialog reabre no próximo ciclo se ainda houver pendentes
        if (autoCloseTimeoutRef.current) {
            clearTimeout(autoCloseTimeoutRef.current);
            autoCloseTimeoutRef.current = null;
        }
        setOpen(false);
    }, []);

    // Alterna o título da aba quando o alerta estiver aberto e a aba estiver oculta
    useEffect(() => {
        if (typeof document === "undefined") return;
        const originalTitle = document.title;
        let interval: number | null = null;

        if (open && document.hidden) {
            interval = window.setInterval(() => {
                document.title =
                    document.title === "⚠️ Consumidores aguardando atendimento!"
                        ? originalTitle
                        : "⚠️ Consumidores aguardando atendimento!";
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
            document.title = originalTitle;
        };
    }, [open]);

    if (!open) return null;

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Há consumidores aguardando atendimento!</AlertDialogTitle>
                    <AlertDialogDescription>
                        Existem consumidores aguardando atendimento. Verifique a página de operação para atendê-los.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={onAcknowledge}>Ok</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


// Alternância do título da aba quando o alerta estiver aberto e a aba estiver oculta
// Mantido fora do componente principal para evitar recriações? Precisamos do estado `open`, então criamos aqui abaixo dentro do mesmo arquivo para clareza.
// Como precisamos de `open`, incluímos esse efeito dentro de um subcomponente que observa `open` via props.


