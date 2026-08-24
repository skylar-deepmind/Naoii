import { cookies, headers } from "next/headers";
import type { Locale } from "@/locales";
import { defaultLocale, getDictionary, type Dictionary } from "@/locales";

export function localeFromAcceptLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  for (const preference of acceptLanguage.split(",")) {
    const language = preference.trim().split(";", 1)[0].toLowerCase();
    if (language === "en" || language.startsWith("en-")) return "en";
    if (language === "ja" || language.startsWith("ja-")) return "ja";
    if (language === "zh" || language.startsWith("zh-")) return "zh";
  }

  return defaultLocale;
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("naoii_lang")?.value;
  if (lang === "zh" || lang === "en" || lang === "ja") return lang;

  const requestHeaders = await headers();
  return localeFromAcceptLanguage(requestHeaders.get("accept-language"));
}

export async function getDict(): Promise<Dictionary> {
  return getDictionary(await getLocale());
}

export type { Locale, Dictionary };
