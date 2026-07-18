"use client";

import { useTheme } from "@/lib/theme";

export function ThemeLogo({ alt }: { alt: string }) {
  const { resolved } = useTheme();
  const src = resolved === "dark"
    ? "/Naoii_logo/naoii-logo-dark.svg"
    : "/Naoii_logo/naoii-logo-light.svg";

  return <img src={src} alt={alt} className="h-8 w-auto" />;
}
