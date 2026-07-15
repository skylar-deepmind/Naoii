"use client";

import NextTopLoader from "nextjs-toploader";
import { ToastProvider } from "@/lib/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <NextTopLoader color="#4f46e5" height={2} showSpinner={false} />
      {children}
    </ToastProvider>
  );
}
