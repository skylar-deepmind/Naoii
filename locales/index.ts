import { zh } from "./zh";
import { en } from "./en";
import { ja } from "./ja";

export type Locale = "zh" | "en" | "ja";
export const locales: Locale[] = ["zh", "en", "ja"];
export const defaultLocale: Locale = "zh";

export const dictionaries = { zh, en, ja } as const;
export type Dictionary = typeof zh;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.zh;
}

export const localeLabels: Record<Locale, string> = {
  zh: "中文",
  en: "English",
  ja: "日本語",
};
