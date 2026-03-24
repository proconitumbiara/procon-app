"use client";

import type { ChamadaCliente } from "@/lib/panel-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Check, Clock, ListOrdered } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";

function normalizeChamada(data: Partial<ChamadaCliente>): ChamadaCliente {
  return {
    nome: typeof data.nome === "string" ? data.nome : "",
    guiche: typeof data.guiche === "string" ? data.guiche : "",
    chamadoEm: data.chamadoEm ?? new Date().toISOString(),
    prioridade: data.prioridade ?? "Comum",
  };
}

function filterValidChamadas(list: ChamadaCliente[]): ChamadaCliente[] {
  return list
    .map(normalizeChamada)
    .filter((c) => c.nome.trim() !== "" || c.guiche.trim() !== "")
    .slice(0, 5);
}

function chamadaKey(c: ChamadaCliente): string {
  return `${c.chamadoEm ?? ""}-${c.nome}-${c.guiche}`;
}

/** Retorna os 4 primeiros nomes (palavras) do nome completo. */
function primeirosDoisNomes(nome: string): string {
  return nome.trim().split(/\s+/).slice(0, 2).join(" ") || "";
}

function playBeep() {
  const ctx = new (window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext)();
  const freqs = [660, 880, 1040];
  const start = ctx.currentTime;
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.18;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start + i * 0.13);
    osc.stop(start + i * 0.13 + 0.11);
    osc.onended = () => {
      gain.disconnect();
      if (i === freqs.length - 1) ctx.close();
    };
  });
}

function speakName(chamada: ChamadaCliente) {
  if (!("speechSynthesis" in window)) return;

  const texto =
    chamada.prioridade === "Prioritário"
      ? `Atendimento Prioritário, ${chamada.nome}, ${chamada.guiche}`
      : `${chamada.nome}, ${chamada.guiche}`;

  const utter = new SpeechSynthesisUtterance(texto);
  utter.lang = "pt-BR";
  utter.rate = 0.98;

  const trySpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const female =
      voices.find(
        (v) =>
          v.lang.startsWith("pt-BR") &&
          (v.name.toLowerCase().includes("feminina") ||
            v.name.toLowerCase().includes("female")),
      ) ||
      voices.find(
        (v) =>
          v.lang.startsWith("pt-BR") &&
          v.name.toLowerCase().includes("brasil"),
      ) ||
      voices.find((v) => v.lang.startsWith("pt-BR"));
    if (female) utter.voice = female;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    trySpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = trySpeak;
  }
}

export default function PainelPage() {
  const [chamadaAtual, setChamadaAtual] = useState<ChamadaCliente | null>(
    null,
  );
  const [ultimasChamadas, setUltimasChamadas] = useState<ChamadaCliente[]>([]);
  const [clockTime, setClockTime] = useState("");
  const [clockDate, setClockDate] = useState("");
  const pusherRef = useRef<Pusher | null>(null);

  const updateClock = useCallback(() => {
    const now = new Date();
    setClockTime(
      now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    );
    setClockDate(
      now.toLocaleDateString("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  useEffect(() => {
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [updateClock]);

  useEffect(() => {
    fetch("/api/painel/ultimas-chamadas")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ChamadaCliente[]) => setUltimasChamadas(filterValidChamadas(data)))
      .catch(() => { });
  }, []);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      activityTimeout: 25000,
      pongTimeout: 15000,
    });

    pusherRef.current = pusher;
    const channel = pusher.subscribe("painel");

    channel.bind("nova-chamada", (data: Partial<ChamadaCliente>) => {
      const nova = normalizeChamada(data);
      setChamadaAtual(nova);
      setUltimasChamadas((prev) =>
        filterValidChamadas([nova, ...prev]),
      );
      playBeep();
      speakName(nova);
    });

    channel.bind("ultimas-chamadas", (data: ChamadaCliente[]) => {
      setUltimasChamadas(filterValidChamadas(data ?? []));
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("painel");
      pusher.disconnect();
    };
  }, []);

  const guicheDisplay =
    chamadaAtual?.prioridade === "Prioritário"
      ? `Prioritário - ${chamadaAtual.guiche}`
      : (chamadaAtual?.guiche ?? "");

  return (
    <div className="flex h-screen min-h-screen w-full flex-col overflow-hidden bg-secondary">
      <div className="flex min-h-0 flex-1 flex-row">
        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center justify-center border-transparent bg-white px-4 py-3 text-center shadow-2xl">
            <h1 className="text-[clamp(1.25rem,2.5vw,2.5rem)] font-bold tracking-wide text-secondary">
              PROCON ITUMBIARA - PAINEL DE ATENDIMENTO
            </h1>
          </header>

          <div className="flex flex-1 flex-col items-center justify-center p-4 md:p-6">
            <Card className="w-full max-w-[90%] bg-white border border-transparent shadow-lg md:max-w-4xl">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center md:gap-6 md:py-16">
                <h2 className="max-w-full whitespace-normal px-2 text-center font-black leading-tight tracking-wide text-secondary text-[clamp(2rem,5vw,6rem)]">
                  {chamadaAtual?.nome
                    ? chamadaAtual.nome
                    : "Aguardando chamada"}
                </h2>
                {chamadaAtual?.guiche && (
                  <p className="font-bold text-primary/75 text-[clamp(1.25rem,2.5vw,3rem)]">
                    {guicheDisplay}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <aside className="flex w-full max-w-88 shrink-0 flex-col items-center justify-between gap-4 border-l border-border bg-white px-4 py-6 shadow-2xl xl:max-w-md">
          <Image
            src="/Logo.svg"
            alt="Logo PROCON Itumbiara"
            width={320}
            height={120}
            priority
            className="h-auto w-full max-w-[18rem] shrink-0 object-contain"
          />

          <Card className="w-full min-w-0 flex-1 overflow-hidden bg-white border-none shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-secondary">
                Últimas chamadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="list-none space-y-2 p-0" role="list">
                {ultimasChamadas.map((c) => (
                  <li
                    key={chamadaKey(c)}
                    className="rounded-md border border-transparent bg-white px-3 py-2 text-xl"
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold text-secondary">
                        {c.nome}
                      </span>
                      {c.prioridade === "Prioritário" && (
                        <Badge variant="default" className="shrink-0 text-xs bg-primary/75 py-0.5 text-white">
                          Prioritário
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-secondary text-md">
                      <span>{c.guiche} - </span>
                      {c.chamadoEm && (
                        <span>
                          {new Date(c.chamadoEm).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>


          <div className="flex shrink-0 flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-2 font-bold text-secondary">
              <span className="text-[clamp(1.25rem,2vw,2rem)] tabular-nums text-2xl">
                {clockTime}
              </span>
            </div>
            <div className="font-medium capitalize text-secondary text-2xl">
              {clockDate}
            </div>
          </div>
        </aside>
      </div>

      <footer className="flex shrink-0 items-center justify-center overflow-hidden bg-primary py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.07)]">
        <span className="painel-marquee inline-block whitespace-nowrap font-bold text-primary-foreground text-[clamp(0.875rem,1.5vw,1.25rem)]">
          SEJAM BEM-VINDOS • MANTENHA SEUS DOCUMENTOS EM MÃOS • AGUARDE SER
          CHAMADO • SIGA NOSSAS REDES SOCIAIS - @PROCONITUMBIARA
        </span>
      </footer>
    </div>
  );
}
