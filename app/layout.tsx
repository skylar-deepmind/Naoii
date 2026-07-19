import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Naoii — 多语言表达训练社区",
    template: "%s | Naoii",
  },
  description:
    "面向语言学习者的自然表达训练社区。发布你的表达，获得母语者的修改建议，在交流中提升语言能力。",
  icons: {
    icon: [
      {
        url: "/Naoii_logo/favicon-light.svg",
        media: "(prefers-color-scheme: light)",
        type: "image/svg+xml",
      },
      {
        url: "/Naoii_logo/favicon-dark.svg",
        media: "(prefers-color-scheme: dark)",
        type: "image/svg+xml",
      },
      {
        url: "/Naoii_logo/favicon-light.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: "/Naoii_logo/favicon-light.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("naoii_lang")?.value;
  const lang = langCookie === "ja" ? "ja" : langCookie === "en" ? "en" : "zh";

  const themeCookie = cookieStore.get("naoii_theme")?.value || "system";
  const prefersDark = themeCookie === "dark" || (themeCookie === "system" && false); // server default light
  const themeClass = prefersDark ? "naoii-dark" : "naoii";

  return (
    <html lang={lang} className="h-full antialiased" data-theme={themeClass} style={{ colorScheme: prefersDark ? "dark" : "light" }} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){try{var t=document.cookie.match(/(?:^|; )naoii_theme=([^;]*)/);var m=(t?t[1]:'')||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.setAttribute('data-theme',d?'naoii-dark':'naoii');document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})()
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-base-100 text-base-content">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
