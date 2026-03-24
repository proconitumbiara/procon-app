"use client";

import type { ChamadaCliente } from "@/lib/panel-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <main className="flex min-w-0 flex-1 flex-col w-full">
          <header className="flex shrink-0 items-center justify-center border-transparent bg-white px-6 py-4 text-center shadow-2xl 2xl:py-6">
            <h1 className="text-[clamp(1.5rem,2.2vw,3.2rem)] font-bold tracking-wide text-secondary 2xl:text-[clamp(2.2rem,2.6vw,3.8rem)]">
              PROCON ITUMBIARA - PAINEL DE ATENDIMENTO
            </h1>
          </header>

          <div className="flex flex-1 flex-col items-center justify-center p-5 md:p-10 2xl:p-14 w-full">
            <Card className="w-full border border-transparent bg-white shadow-lg md:max-w-[88%] 2xl:max-w-[92%]">
              <CardContent className="flex flex-col items-center justify-center gap-6 py-16 text-center md:gap-8 md:py-22 2xl:gap-10 2xl:py-28">
                <h2 className="max-w-full whitespace-nowrap px-6 text-center font-black leading-none tracking-wide text-secondary text-[clamp(2.8rem,4.4vw,7rem)] 2xl:text-[clamp(4rem,4.8vw,8.2rem)]">
                  {chamadaAtual?.nome
                    ? chamadaAtual.nome
                    : "Aguardando chamada"}
                </h2>
                {chamadaAtual?.guiche && (
                  <p className="font-bold text-primary/75 text-[clamp(1.8rem,2.8vw,4rem)] 2xl:text-[clamp(2.5rem,3.2vw,4.8rem)]">
                    {guicheDisplay}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <aside className="flex w-full max-w-xl shrink-0 flex-col items-center justify-between gap-6 border-l border-border bg-white px-8 py-8 shadow-2xl 2xl:max-w-2xl 2xl:px-10 2xl:py-10">
          <Image
            src="/Logo.svg"
            alt="Logo PROCON Itumbiara"
            width={520}
            height={180}
            priority
            className="h-auto w-full max-w-120 shrink-0 object-contain 2xl:max-w-136"
          />

          <Card className="w-full min-w-0 flex-1 overflow-hidden border-none bg-white shadow-none">
            <CardHeader className="pb-4 2xl:pb-5">
              <CardTitle className="flex items-center gap-2 text-4xl font-bold text-secondary 2xl:text-5xl">
                Últimas chamadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-none space-y-4 p-0" role="list">
                {ultimasChamadas.map((c) => (
                  <li
                    key={chamadaKey(c)}
                    className="rounded-md border border-transparent bg-white px-4 py-3 text-3xl 2xl:text-4xl"
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                      <span className="font-semibold text-secondary text-3xl 2xl:text-4xl">
                        {c.nome}
                      </span>
                      {c.prioridade === "Prioritário" && (
                        <Badge variant="default" className="shrink-0 bg-primary/75 px-3 py-1.5 text-base text-white 2xl:text-lg">
                          Prioritário
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-2xl text-secondary 2xl:text-3xl">
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


          <div className="flex shrink-0 flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2 font-bold text-secondary">
              <span className="tabular-nums text-[clamp(2rem,2.8vw,3.2rem)] 2xl:text-[clamp(2.8rem,3vw,4rem)]">
                {clockTime}
              </span>
            </div>
            <div className="font-medium capitalize text-3xl text-secondary 2xl:text-4xl">
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
