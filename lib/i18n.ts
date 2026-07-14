import { cookies } from "next/headers";
import type { Locale } from "@/locales";
import { defaultLocale, getDictionary, type Dictionary } from "@/locales";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("naoii_lang")?.value;
  if (lang === "zh" || lang === "en" || lang === "ja") return lang;
  return defaultLocale;
}

export async function getDict(): Promise<Dictionary> {
  return getDictionary(await getLocale());
}

export type { Locale, Dictionary };
