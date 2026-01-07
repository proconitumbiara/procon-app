"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PopupProps {
  imageSrc?: string;
  redirectUrl?: string;
  storageKey?: string;
}

export default function Popup({
  imageSrc = "/popup-img.png",
  redirectUrl = "http://www.pcdlegal.com.br/cdc",
  storageKey = "procon-popup-closed",
}: PopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verifica se o popup já foi fechado anteriormente
    const hasClosedPopup = localStorage.getItem(storageKey);

    if (!hasClosedPopup) {
      // Pequeno delay para melhor experiência do usuário
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const handleClose = () => {
    setIsOpen(false);
    // Salva no localStorage que o popup foi fechado
    localStorage.setItem(storageKey, "true");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-[90vw] border-0 bg-transparent p-0 shadow-none sm:max-w-2xl lg:max-w-4xl"
        showCloseButton={false}
        onInteractOutside={handleClose}
        onEscapeKeyDown={handleClose}
      >
        <div className="relative w-full">
          {/* Botão de fechar */}
          <button
            onClick={handleClose}
            className="focus:ring-primary absolute top-2 right-2 z-50 flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full bg-white/90 p-2.5 shadow-lg transition-all duration-200 hover:bg-white focus:ring-2 focus:ring-offset-2 focus:outline-none active:bg-white/80 sm:top-4 sm:right-4 sm:min-h-0 sm:min-w-0 sm:p-2"
            aria-label="Fechar popup"
          >
            <X className="h-6 w-6 text-gray-800 sm:h-5 sm:w-5" />
          </button>

          {/* Link clicável na imagem */}
          <Link
            href={redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block w-full cursor-pointer"
            onClick={() => {
              handleClose();
            }}
            aria-label="Acessar CDC Acessível (abre em nova aba)"
          >
            <div className="relative h-auto w-full">
              <Image
                src={imageSrc}
                alt="CDC Acessível - Código de Defesa do Consumidor em Linguagem Simples"
                width={800}
                height={600}
                className="h-auto w-full rounded-lg shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] group-active:scale-[0.98]"
                priority
                unoptimized
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 672px, 896px"
              />
              {/* Overlay sutil no hover para indicar que é clicável */}
              <div className="pointer-events-none absolute inset-0 rounded-lg bg-black/0 transition-colors duration-300 group-hover:bg-black/5 group-active:bg-black/10" />
            </div>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
