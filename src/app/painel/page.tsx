"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";

interface Chamada {
  nome: string;
  guiche: string;
  chamadoEm?: string;
  prioridade?: "Comum" | "Prioritário";
}

function playBeep() {
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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

function speakName(chamada: Chamada) {
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
            v.name.toLowerCase().includes("female"))
      ) ||
      voices.find(
        (v) => v.lang.startsWith("pt-BR") && v.name.toLowerCase().includes("brasil")
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
  const [chamadaAtual, setChamadaAtual] = useState<Chamada | null>(null);
  const [ultimasChamadas, setUltimasChamadas] = useState<Chamada[]>([]);
  const [clockTime, setClockTime] = useState("");
  const [clockDate, setClockDate] = useState("");
  const pusherRef = useRef<Pusher | null>(null);

  // Relógio
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClockTime(
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setClockDate(
        now.toLocaleDateString("pt-BR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Conexão Pusher
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      // Heartbeat agressivo para manter conexão estável mesmo sem chamadas por horas
      activityTimeout: 25000,
      pongTimeout: 15000,
    });

    pusherRef.current = pusher;

    const channel = pusher.subscribe("painel");

    channel.bind("nova-chamada", (data: Chamada) => {
      setChamadaAtual(data);
      setUltimasChamadas((prev) => {
        const nova = {
          nome: data.nome,
          guiche: data.guiche,
          chamadoEm: data.chamadoEm ?? new Date().toISOString(),
          prioridade: data.prioridade,
        };
        return [nova, ...prev].slice(0, 5);
      });
      playBeep();
      speakName(data);
    });

    channel.bind("ultimas-chamadas", (data: Chamada[]) => {
      setUltimasChamadas(data.slice(0, 5));
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;600;700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          height: 100vh;
          overflow: hidden;
          font-family: 'Roboto', Arial, Helvetica, sans-serif;
          background: #0a2240;
        }

        .painel-layout {
          display: flex;
          flex-direction: row;
          width: 100vw;
          height: 100vh;
          position: relative;
        }

        .painel-main {
          width: 80vw;
          height: 110%;
          display: flex;
          flex-direction: column;
        }

        .painel-header {
          background: #fff;
          color: #22223b;
          font-size: 4rem;
          font-weight: bold;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          letter-spacing: 1px;
          width: 100%;
          height: 5vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .painel-center {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 99%;
          height: 90vh;
          margin: 0 9px;
        }

        .painel-card {
          background: rgba(255,255,255,0.92);
          border-radius: 2rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          width: 90%;
          height: auto;
          text-align: center;
        }

        .painel-card h2 {
          font-size: 9rem;
          font-weight: 900;
          color: #22223b;
          margin-bottom: 2rem;
          letter-spacing: 0.08em;
          padding: 0 10px;
        }

        .painel-card p {
          font-size: 6rem;
          color: #0a2240;
          font-weight: bold;
        }

        .painel-sidebar {
          width: 20vw;
          height: 96vh;
          background: #fff;
          box-shadow: -2px 0 16px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .painel-sidebar img {
          width: 32rem;
          height: auto;
          margin-bottom: 2rem;
        }

        .latest-calls {
          text-align: center;
          margin-bottom: 2rem;
        }

        .latest-calls-title {
          font-size: 4rem;
          color: #0a2240;
          font-weight: 900;
        }

        .latest-calls ul {
          list-style: none;
          text-align: left;
          padding: 0;
        }

        .latest-calls ul li {
          margin-bottom: 20px;
          margin-top: 20px;
          color: #0a2240;
          font-weight: 600;
          font-size: 2rem;
        }

        .latest-calls ul li span {
          font-size: 1.6rem;
          color: #888;
        }

        .painel-clock {
          text-align: center;
          margin-bottom: 1rem;
        }

        .clock-time {
          font-size: 6rem;
          font-weight: bold;
          color: #0a2240;
          text-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .clock-date {
          font-size: 2rem;
          color: #0a2240;
          font-weight: bold;
          text-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .painel-footer {
          background: #d90429;
          color: #fff;
          text-align: center;
          font-weight: 600;
          overflow: hidden;
          position: fixed;
          left: 0;
          bottom: 0;
          width: 100vw;
          height: 4vh;
          box-shadow: 0 -2px 8px rgba(0,0,0,0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .marquee {
          white-space: nowrap;
          display: inline-block;
          animation: marquee 30s linear infinite;
          font-size: 3rem;
          font-weight: 900;
        }

        @keyframes marquee {
          0%   { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
      `}</style>

      <div className="painel-layout">
        <div className="painel-main">
          <header className="painel-header">
            PROCON ITUMBIARA - PAINEL DE ATENDIMENTO
          </header>

          <div className="painel-center">
            <div className="painel-card">
              <h2>{chamadaAtual?.nome ?? ""}</h2>
              <p>{guicheDisplay}</p>
            </div>
          </div>
        </div>

        <aside className="painel-sidebar">
          <Image
            src="/Logo.svg"
            alt="Logo PROCON Itumbiara"
            width={320}
            height={120}
            priority
            style={{ width: "32rem", height: "auto", marginBottom: "2rem" }}
          />

          <div className="latest-calls">
            <span className="latest-calls-title">ÚLTIMAS CHAMADAS</span>
            <ul>
              {ultimasChamadas.map((c, idx) => (
                <li key={idx}>
                  {c.nome} - {c.guiche}
                  {c.chamadoEm && (
                    <span>
                      {" "}
                      (
                      {new Date(c.chamadoEm).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      )
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="painel-clock">
            <div className="clock-time">{clockTime}</div>
            <div className="clock-date">{clockDate}</div>
          </div>
        </aside>
      </div>

      <footer className="painel-footer">
        <span className="marquee">
          SEJAM BEM-VINDOS • MANTENHA SEUS DOCUMENTOS EM MÃOS • AGUARDE SER
          CHAMADO • SIGA NOSSAS REDES SOCIAIS - @PROCONITUMBIARA
        </span>
      </footer>
    </>
  );
}
