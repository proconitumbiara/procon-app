"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AccessibilityContextType {
  highContrast: boolean;
  largeFont: boolean;
  toggleHighContrast: () => void;
  toggleLargeFont: () => void;
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  // Inicialização lazy do estado a partir do localStorage
  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessibility-high-contrast") === "true";
    }
    return false;
  });

  const [largeFont, setLargeFont] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessibility-large-font") === "true";
    }
    return false;
  });

  // Aplicar classes no documento quando o estado mudar
  useEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;
    const body = document.body;

    if (highContrast) {
      html.classList.add("high-contrast");
      body.classList.add("high-contrast");
    } else {
      html.classList.remove("high-contrast");
      body.classList.remove("high-contrast");
    }

    if (largeFont) {
      html.classList.add("large-font");
      body.classList.add("large-font");
    } else {
      html.classList.remove("large-font");
      body.classList.remove("large-font");
    }
  }, [highContrast, largeFont]);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem("accessibility-high-contrast", String(newValue));
    }
  };

  const toggleLargeFont = () => {
    const newValue = !largeFont;
    setLargeFont(newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem("accessibility-large-font", String(newValue));
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        largeFont,
        toggleHighContrast,
        toggleLargeFont,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider",
    );
  }
  return context;
}
