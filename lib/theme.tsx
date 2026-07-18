"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

export type ThemeMode = "system" | "light" | "dark";

interface ThemeContextValue {
  theme: ThemeMode;
  resolved: "light" | "dark";
  setTheme: (t: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

function applyTheme(mode: ThemeMode) {
  const resolved = resolveTheme(mode);
  document.documentElement.setAttribute("data-theme", resolved === "dark" ? "naoii-dark" : "naoii");
  document.documentElement.style.colorScheme = resolved;
}

export function ThemeProvider({ children, initialTheme }: { children: ReactNode; initialTheme?: ThemeMode }) {
  const [theme, setThemeState] = useState<ThemeMode>(initialTheme || "system");

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    setCookie("naoii_theme", t);
    applyTheme(t);
  }, []);

  useEffect(() => {
    // Apply on mount with resolved mode
    applyTheme(theme);

    // Listen for system theme changes when in system mode
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  const resolved = resolveTheme(theme);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
