"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import LegalDialog from "./LegalDialog";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [openDialog, setOpenDialog] = useState<
    "privacy" | "terms" | "accessibility" | null
  >(null);

  const footerLinks = {
    institucional: [
      { href: "/sobre-nos", label: "Sobre Nós" },
      { href: "/servicos", label: "Serviços" },
      { href: "/projetos", label: "Projetos" },
      { href: "/noticias", label: "Notícias" },
      { href: "/pesquisa-de-precos", label: "Pesquisas" },
      { href: "/#cdc", label: "Código de Defesa do Consumidor" },
    ],
    legal: [
      { type: "privacy" as const, label: "Política de Privacidade" },
      { type: "terms" as const, label: "Termos de Uso" },
      { type: "accessibility" as const, label: "Acessibilidade" },
    ],
  };

  const handleOpenDialog = (type: "privacy" | "terms" | "accessibility") => {
    setOpenDialog(type);
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  return (
    <footer
      className="border-border bg-muted/20 border-t"
      role="contentinfo"
      aria-label="Rodapé do site"
    >
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Informações Institucionais */}
          <div className="space-y-4">
            <h3 className="text-foreground text-lg font-semibold">
              Informações Institucionais
            </h3>
            <div className="text-muted-foreground space-y-2 text-sm">
              <p>
                Procon Itumbiara - Fundo Municipal de Proteção e Defesa do
                Consumidor
              </p>
              <p>CNPJ: 08.242.183/0001-63</p>
              <p>Endereço: Av. Porto Nacional, 495</p>
              <p>CEP: 75528-122</p>
              <p>Horário de Atendimento: Segunda a Sexta, 7h às 13h</p>
            </div>
          </div>

          {/* Links Institucionais */}
          <div className="space-y-4">
            <h3 className="text-foreground text-lg font-semibold">
              Links Institucionais
            </h3>
            <nav aria-label="Links institucionais">
              <ul className="space-y-2">
                {footerLinks.institucional.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground rounded-sm text-sm no-underline transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Links Legais */}
          <div className="space-y-4">
            <h3 className="text-foreground text-lg font-semibold">
              Informações Legais
            </h3>
            <nav aria-label="Links legais">
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.type}>
                    <button
                      type="button"
                      onClick={() => handleOpenDialog(link.type)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer rounded-sm text-left text-sm no-underline transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-foreground text-lg font-semibold">Contato</h3>
            <div className="text-muted-foreground space-y-2 text-sm">
              <p>
                <span className="sr-only">Telefone:</span>
                <a
                  href="tel:+556434321215"
                  className="hover:text-foreground focus:ring-primary rounded-sm no-underline transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  aria-label="Ligar para (64) 3432-1215"
                >
                  (64) 3432-1215
                </a>
              </p>
              <p>
                <span className="sr-only">E-mail:</span>
                <a
                  href="mailto:proconitumbiara@gmail.com"
                  className="hover:text-foreground focus:ring-primary rounded-sm no-underline transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  aria-label="Enviar e-mail para proconitumbiara@gmail.com"
                >
                  proconitumbiara@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-muted-foreground text-center text-sm sm:text-left">
            © {currentYear} Procon Itumbiara. Todos os direitos reservados.{" "}
            <br />
            <span className="inline-block text-xs font-light">
              Desenvolvido por Procon Itumbiara
            </span>
          </p>

          <div className="text-muted-foreground flex items-center justify-between gap-4 text-sm">
            <span>Apoio:</span>
            <div className="flex items-center gap-2">
              <Link href="https://www.itumbiara.go.gov.br/" target="_blank">
                <Image
                  src="/LogoPrefeitura.png"
                  alt="Prefeitura de Itumbiara"
                  width={100}
                  height={100}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs Legais */}
      {openDialog && (
        <LegalDialog
          type={openDialog}
          open={openDialog !== null}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseDialog();
            }
          }}
        />
      )}
    </footer>
  );
}
