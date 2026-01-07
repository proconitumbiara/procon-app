"use client";

import { Hand, SquareArrowOutUpRightIcon } from "lucide-react";
import { useState } from "react";

import { useAccessibility } from "@/lib/AccessibilityContext";
import { cn } from "@/lib/utils";

export default function AccessibilityPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { highContrast, largeFont, toggleHighContrast, toggleLargeFont } =
    useAccessibility();

  return (
    <div className="fixed right-0 bottom-4 z-50 flex items-center md:top-1/2 md:bottom-auto md:-translate-y-1/2">
      {/* Aba Vertical */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "bg-secondary text-secondary-foreground rounded-l-lg shadow-lg",
          "px-2 py-4 md:px-3 md:py-6",
          "hover:bg-secondary/90 transition-colors",
          "hover:ring-ring hover:ring-2 hover:ring-offset-2 hover:outline-none",
          "flex flex-col items-center gap-1 md:gap-2",
          "min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto",
        )}
        aria-expanded={isExpanded}
        aria-label={
          isExpanded
            ? "Fechar painel de acessibilidade"
            : "Abrir painel de acessibilidade"
        }
      >
        <Hand className="h-5 w-5" />
        <span
          className="hidden text-[10px] font-medium sm:block md:text-xs"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          Acessibilidade
        </span>
      </button>

      {/* Painel Expansível */}
      <div
        className={cn(
          "bg-card border-border rounded-l-lg border shadow-xl",
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "w-64 opacity-100 md:w-64" : "w-0 opacity-0",
        )}
        aria-hidden={!isExpanded}
      >
        <div className="min-w-[240px] space-y-3 p-3 md:min-w-[256px] md:space-y-4 md:p-4">
          <h2 className="text-card-foreground mb-3 text-base font-semibold md:mb-4 md:text-lg">
            Acessibilidade
          </h2>

          {/* Toggle Alto Contraste */}
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="high-contrast-toggle"
              className="text-foreground flex-1 cursor-pointer text-xs font-medium md:text-sm"
            >
              Alto Contraste
            </label>
            <button
              type="button"
              id="high-contrast-toggle"
              role="switch"
              aria-checked={highContrast}
              onClick={toggleHighContrast}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                "min-h-[24px] min-w-[44px]",
                highContrast ? "bg-primary" : "bg-muted",
              )}
              aria-label={
                highContrast
                  ? "Desativar alto contraste"
                  : "Ativar alto contraste"
              }
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  "hover:ring-ring hover:ring-2 hover:ring-offset-2 hover:outline-none",
                  highContrast ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
          </div>

          {/* Toggle Fonte Grande */}
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="large-font-toggle"
              className="text-foreground flex-1 cursor-pointer text-xs font-medium md:text-sm"
            >
              Fonte grande
            </label>
            <button
              type="button"
              id="large-font-toggle"
              role="switch"
              aria-checked={largeFont}
              onClick={toggleLargeFont}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                "min-h-[24px] min-w-[44px]",
                largeFont ? "bg-primary" : "bg-muted",
              )}
              aria-label={
                largeFont ? "Desativar fonte grande" : "Ativar fonte grande"
              }
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  "hover:ring-ring hover:ring-2 hover:ring-offset-2 hover:outline-none",
                  largeFont ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
          </div>

          {/* Link CDC - Acessível */}
          <a
            href="http://www.pcdlegal.com.br/cdc/libras/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex w-full items-center justify-between gap-2",
              "rounded-md px-3 py-2",
              "text-foreground text-xs font-medium md:text-sm",
              "bg-muted hover:bg-muted/80",
              "transition-colors",
              "hover:ring-ring no-underline hover:ring-2 hover:ring-offset-2 hover:outline-none",
              "min-h-[44px]",
            )}
            aria-label="Acesse o CDC - Acessível (abre em nova aba)"
          >
            <span className="flex-1 outline-none">CDC - Acessível</span>
            <SquareArrowOutUpRightIcon className="text-foreground h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
