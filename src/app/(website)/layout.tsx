import "../globals.css";

import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "next-themes";

import AccessibilityPanel from "@/components/website/global/AccessibilityPanel";
import ForceLightTheme from "@/components/website/global/ForceLightTheme";
import Popup from "@/components/website/home/Popup";
import { AccessibilityProvider } from "@/lib/AccessibilityContext";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Procon Itumbiara - Proteção e Defesa do Consumidor",
  description:
    "Site institucional do Procon - Fundação de Proteção e Defesa do Consumidor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const html = document.documentElement;
                html.classList.remove('dark');
                html.classList.add('light');
              })();
            `,
          }}
        />
      </head>
      <body className={`${montserrat.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ForceLightTheme />
          <AccessibilityProvider>
            {/* Skip Link para Acessibilidade */}
            <a href="#main-content" className="skip-link">
              Pular para o conteúdo principal
            </a>
            {children}
            <AccessibilityPanel />
            <Popup />
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
