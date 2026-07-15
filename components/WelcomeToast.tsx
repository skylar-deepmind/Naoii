"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/lib/toast";

export function WelcomeToast({ message }: { message: string }) {
  const { addToast } = useToast();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    addToast(message);
  }, [addToast, message]);

  return null;
}
