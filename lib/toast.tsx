"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ─── Types ──────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
}

// ─── Context ────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1500);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ─── Toast Container ────────────────────────────────

const typeStyles: Record<ToastType, string> = {
  success: "alert-success",
  error: "alert-error",
  info: "alert-info",
};

const typeIcons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast toast-top toast-center z-[9999] pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`alert ${typeStyles[toast.type]} pointer-events-auto shadow-lg animate-[fadeIn_0.2s_ease-out]`}
        >
          <span className="text-sm font-medium">
            {typeIcons[toast.type]} {toast.message}
          </span>
        </div>
      ))}
    </div>
  );
}
