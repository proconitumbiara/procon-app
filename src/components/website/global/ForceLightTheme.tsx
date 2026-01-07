"use client";

import { useEffect } from "react";

export default function ForceLightTheme() {
  useEffect(() => {
    // Força o tema claro removendo a classe dark e garantindo light
    const html = document.documentElement;
    html.classList.remove("dark");
    html.classList.add("light");

    // Observa mudanças no DOM para garantir que a classe dark não seja adicionada
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const target = mutation.target as HTMLElement;
          if (target.classList.contains("dark")) {
            target.classList.remove("dark");
            target.classList.add("light");
          }
        }
      });
    });

    // Observa mudanças na classe do elemento HTML
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Limpa o observer quando o componente é desmontado
    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}

