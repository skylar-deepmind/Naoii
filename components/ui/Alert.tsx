"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  info: "alert-info",
  success: "alert-success",
  warning: "alert-warning",
  error: "alert-error",
} as const;

const variantIcons = {
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 stroke-current">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  ),
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 stroke-current">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 stroke-current">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.714-1.14 1.102-2.04L14.298 4.417c-.613-1.053-2.14-1.053-2.753 0L3.34 16.97c-.612 1.053.048 2.04 1.102 2.04z" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 stroke-current">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m-1-9a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  ),
} as const;

type AlertVariant = keyof typeof variantClasses;

interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  dismissible?: boolean;
  className?: string;
}

export function Alert({
  children,
  variant = "info",
  dismissible = false,
  className,
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={cn("alert", variantClasses[variant], className)}
      role="alert"
    >
      {variantIcons[variant]}
      <span className="text-sm">{children}</span>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="btn btn-ghost btn-xs ml-auto"
          aria-label="关闭"
        >
          ✕
        </button>
      )}
    </div>
  );
}
