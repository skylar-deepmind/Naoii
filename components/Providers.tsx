"use client";

import NextTopLoader from "nextjs-toploader";
import { ToastProvider } from "@/lib/toast";
import { ThemeProvider } from "@/lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ThemeProvider>
        <NextTopLoader color="#0075de" height={2} showSpinner={false} />
        {children}
      </ThemeProvider>
    </ToastProvider>
  );
}
