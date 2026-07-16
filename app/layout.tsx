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
    icon: "/naoii-favicon.svg",
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

  return (
    <html lang={lang} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-base-100 text-base-content">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
